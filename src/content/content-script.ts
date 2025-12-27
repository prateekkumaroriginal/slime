import type { FillRule, FieldMapping, ExtensionMessage } from '@/shared/types';
import { generateValue } from '@/lib/value-generator';

// Find an input element based on the field mapping
function findElement(mapping: FieldMapping): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null {
  const { selector, matchType } = mapping;

  try {
    switch (matchType) {
      case 'name':
        return document.querySelector(`[name="${selector}"]`);
      case 'id':
        return document.getElementById(selector) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
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

  for (const field of rule.fields) {
    const element = findElement(field);

    if (!element) {
      errors.push(`Element not found: ${field.matchType}="${field.selector}"`);
      continue;
    }

    // Generate value (handles templates)
    const { value, newIncrement } = generateValue(field.value, currentIncrement);
    currentIncrement = newIncrement;

    if (setElementValue(element, value)) {
      filledCount++;
    } else {
      errors.push(`Failed to set value for: ${field.matchType}="${field.selector}"`);
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

