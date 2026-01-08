import type { FillRule, FieldMapping, ExtensionMessage, PostAction } from '@/shared/types';
import { generateValue } from '@/lib/value-generator';

// Execute a single PostAction
async function executePostAction(action: PostAction): Promise<boolean> {
  try {
    switch (action.type) {
      case 'click': {
        if (!action.selector) return false;
        const element = document.querySelector(action.selector);
        if (element instanceof HTMLElement) {
          element.click();
          return true;
        }
        return false;
      }

      case 'focus': {
        if (!action.selector) return false;
        const element = document.querySelector(action.selector);
        if (element instanceof HTMLElement) {
          element.focus();
          return true;
        }
        return false;
      }

      case 'pressKey': {
        if (!action.key) return false;
        const activeElement = document.activeElement || document.body;
        const keyEvent = new KeyboardEvent('keydown', {
          key: action.key,
          code: action.key,
          bubbles: true,
          cancelable: true,
        });
        activeElement.dispatchEvent(keyEvent);
        
        // Also dispatch keyup
        const keyUpEvent = new KeyboardEvent('keyup', {
          key: action.key,
          code: action.key,
          bubbles: true,
          cancelable: true,
        });
        activeElement.dispatchEvent(keyUpEvent);
        return true;
      }

      case 'wait': {
        const delay = action.delay ?? 0;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return true;
      }

      default:
        return false;
    }
  } catch {
    return false;
  }
}

// Parse /regex/ syntax - returns the pattern if wrapped in slashes, otherwise null
function parseRegexSelector(selector: string): RegExp | null {
  const match = selector.match(/^\/(.+)\/$/);
  if (match) {
    try {
      return new RegExp(match[1]);
    } catch {
      return null;
    }
  }
  return null;
}

// Find element by attribute using regex matching
function findElementByRegex(
  attrName: 'id' | 'name',
  regex: RegExp
): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null {
  const elements = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    'input, textarea, select'
  );
  for (const el of elements) {
    const attrValue = el.getAttribute(attrName);
    if (attrValue && regex.test(attrValue)) {
      return el;
    }
  }
  return null;
}

// Find an input element based on the field mapping
function findElement(mapping: FieldMapping): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null {
  const { selector, matchType } = mapping;

  try {
    switch (matchType) {
      case 'id': {
        const regex = parseRegexSelector(selector);
        if (regex) {
          return findElementByRegex('id', regex);
        }
        return document.getElementById(selector) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
      }
      case 'name': {
        const regex = parseRegexSelector(selector);
        if (regex) {
          return findElementByRegex('name', regex);
        }
        return document.querySelector(`[name="${selector}"]`);
      }
      case 'querySelector':
        return document.querySelector(selector);
      default:
        return null;
    }
  } catch {
    return null;
  }
}

// Set value on an element and trigger appropriate events
function setElementValue(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string
): boolean {
  try {
    // Handle different input types
    if (element instanceof HTMLSelectElement) {
      // For select elements, find and select the matching option
      const option = Array.from(element.options).find(
        (opt) => opt.value === value || opt.text === value
      );
      if (option) {
        element.value = option.value;
      } else {
        element.value = value;
      }
    } else if (element instanceof HTMLInputElement) {
      const type = element.type.toLowerCase();

      if (type === 'checkbox') {
        element.checked = value === 'true' || value === '1' || value === 'yes';
      } else if (type === 'radio') {
        element.checked = element.value === value;
      } else {
        element.value = value;
      }
    } else {
      element.value = value;
    }

    // Dispatch events to trigger any listeners
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));

    return true;
  } catch {
    return false;
  }
}

// Fill form fields based on a rule
async function fillForm(rule: FillRule): Promise<{ filledCount: number; errors: string[] }> {
  let filledCount = 0;
  const errors: string[] = [];
  let currentIncrement = rule.incrementCounter;
  let allFieldsSuccessful = true;

  for (const field of rule.fields) {
    const element = findElement(field);

    if (!element) {
      errors.push(`Element not found: ${field.matchType}="${field.selector}"`);
      allFieldsSuccessful = false;
      continue;
    }

    // Generate value (handles templates)
    const { value, newIncrement } = generateValue(field.value, currentIncrement);
    currentIncrement = newIncrement;

    if (setElementValue(element, value)) {
      filledCount++;
      
      // Execute field's postAction if it exists
      if (field.postAction) {
        const actionSuccess = await executePostAction(field.postAction);
        if (!actionSuccess) {
          errors.push(`PostAction failed for field: ${field.matchType}="${field.selector}"`);
        }
      }
    } else {
      errors.push(`Failed to set value for: ${field.matchType}="${field.selector}"`);
      allFieldsSuccessful = false;
    }
  }

  // Execute rule-level postActions if all fields were successful
  if (allFieldsSuccessful && rule.postActions && rule.postActions.length > 0) {
    for (const action of rule.postActions) {
      const actionSuccess = await executePostAction(action);
      if (!actionSuccess) {
        errors.push(`Rule PostAction failed: ${action.type}`);
      }
    }
  }

  // Update increment counter if it changed
  if (currentIncrement !== rule.incrementCounter) {
    chrome.runtime.sendMessage({
      type: 'UPDATE_INCREMENT',
      ruleId: rule.id,
      newValue: currentIncrement,
    });
  }

  return { filledCount, errors };
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((message: ExtensionMessage & { rule?: FillRule }, _sender, sendResponse) => {
  if (message.type === 'FILL_FORM' && message.rule) {
    fillForm(message.rule).then((result) => {
      sendResponse({
        type: 'FILL_COMPLETE',
        success: result.errors.length === 0,
        filledCount: result.filledCount,
        errors: result.errors,
      });
    });
    return true; // Keep channel open for async response
  }
});

// Log that content script is loaded (for debugging)
console.log('[Slime] Content script loaded');

