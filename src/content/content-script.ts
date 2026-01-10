import type { FillRule, FieldMapping, ExtensionMessage, FABSettings, PostAction } from '@/shared/types';
import { generateValue } from '@/lib/value-generator';

// ─────────────────────────────────────────────────────────────────────────────
// FAB State
// ─────────────────────────────────────────────────────────────────────────────

let fabContainer: HTMLDivElement | null = null;
let fabShadowRoot: ShadowRoot | null = null;
let fabButton: HTMLButtonElement | null = null;
let miniPopup: HTMLDivElement | null = null;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let fabStartX = 0;
let fabStartY = 0;
let currentSettings: FABSettings | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// FAB Styles
// ─────────────────────────────────────────────────────────────────────────────

const FAB_STYLES = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .slime-fab {
    position: fixed;
    z-index: 2147483647;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: radial-gradient(circle at center, #098c7e 0%, #000000 80%, #048a65 100%);
    border: none;
    cursor: grab;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(16, 185, 129, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
  }

  .slime-fab:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5), 0 0 0 3px rgba(16, 185, 129, 0.35);
  }

  .slime-fab:active, .slime-fab.dragging {
    cursor: grabbing;
    transform: scale(1.05);
  }

  .slime-fab svg {
    width: 24px;
    height: 24px;
    fill: white;
    pointer-events: none;
  }

  .slime-fab-icon {
    width: 32px;
    height: 32px;
    pointer-events: none;
    border-radius: 50%;
    object-fit: contain;
  }

  /* Popup - matches main extension popup */
  .slime-popup {
    position: fixed;
    z-index: 2147483646;
    width: 288px;
    background: #18181b;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    padding: 16px;
    opacity: 0;
    transform: scale(0.95) translateY(8px);
    transition: opacity 0.15s ease, transform 0.15s ease;
    pointer-events: none;
    color: #fafafa;
  }

  .slime-popup.visible {
    opacity: 1;
    transform: scale(1) translateY(0);
    pointer-events: auto;
  }

  .slime-popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .slime-popup-title {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: -0.025em;
    color: #10b981;
  }

  .slime-popup-settings {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease;
    color: #a1a1aa;
  }

  .slime-popup-settings:hover {
    background: #27272a;
  }

  .slime-popup-settings svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }

  /* 2-column grid matching main popup */
  .slime-rule-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    max-height: 280px;
    overflow-y: auto;
  }

  .slime-rule-btn {
    position: relative;
    padding: 12px 16px;
    background: #27272a;
    border: 1px solid #3f3f46;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #fafafa;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .slime-rule-btn:hover {
    background: #3f3f46;
    border-color: #52525b;
  }

  .slime-rule-btn:active {
    background: #52525b;
  }

  .slime-rule-btn.loading {
    opacity: 0.5;
    cursor: wait;
  }

  .slime-rule-btn.default {
    border-color: #10b981;
    box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.3);
  }

  .slime-rule-btn .slime-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #3f3f46;
    border-top-color: #10b981;
    border-radius: 50%;
    animation: slime-spin 0.6s linear infinite;
    margin: 0 auto;
  }

  .slime-star-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 12px;
    height: 12px;
  }

  .slime-star-badge svg {
    width: 12px;
    height: 12px;
    fill: #fbbf24;
  }

  .slime-no-rules {
    text-align: center;
    padding: 24px 0;
  }

  .slime-no-rules-text {
    color: #71717a;
    font-size: 14px;
    margin-bottom: 12px;
  }

  .slime-create-link {
    color: #10b981;
    font-size: 14px;
    font-weight: 500;
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.15s ease;
  }

  .slime-create-link:hover {
    color: #34d399;
  }

  /* Context menu for right-click */
  .slime-context-menu {
    position: absolute;
    background: #27272a;
    border: 1px solid #3f3f46;
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    min-width: 160px;
  }

  .slime-context-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    font-size: 13px;
    color: #d4d4d8;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.15s ease;
  }

  .slime-context-item:hover {
    background: #3f3f46;
  }

  .slime-context-item svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }

  .slime-context-item.active {
    color: #fbbf24;
  }

  /* Confirm dialog */
  .slime-confirm-dialog {
    padding: 4px 0;
  }

  .slime-confirm-text {
    font-size: 14px;
    color: #d4d4d8;
    margin-bottom: 12px;
    line-height: 1.5;
  }

  .slime-confirm-warning {
    color: #fbbf24;
    font-size: 13px;
    margin-bottom: 12px;
    padding: 8px 12px;
    background: rgba(251, 191, 36, 0.1);
    border-radius: 6px;
  }

  .slime-confirm-buttons {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .slime-btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: background 0.15s ease;
  }

  .slime-btn-cancel {
    background: #3f3f46;
    color: #d4d4d8;
  }

  .slime-btn-cancel:hover {
    background: #52525b;
  }

  .slime-btn-confirm {
    background: #10b981;
    color: white;
  }

  .slime-btn-confirm:hover {
    background: #059669;
  }

  .slime-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .slime-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #3f3f46;
    border-top-color: #10b981;
    border-radius: 50%;
    animation: slime-spin 0.6s linear infinite;
  }

  @keyframes slime-spin {
    to { transform: rotate(360deg); }
  }
`;

// Slime logo URL (loaded from extension assets)
const SLIME_LOGO_URL = chrome.runtime.getURL('icons/slime_logo_48.png');

// Settings gear icon
const SETTINGS_ICON_SVG = `<svg viewBox="0 0 24 24"><path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/></svg>`;

// Star icon (outline)
const STAR_OUTLINE_SVG = `<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;

// ─────────────────────────────────────────────────────────────────────────────
// Form Filling Functions (existing)
// ─────────────────────────────────────────────────────────────────────────────

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
      
      // Execute field's postActions chain if it exists
      if (field.postActions && field.postActions.length > 0) {
        for (const action of field.postActions) {
          const actionSuccess = await executePostAction(action);
          if (!actionSuccess) {
            errors.push(`Field PostAction chain stopped: ${action.type} failed for field: ${field.matchType}="${field.selector}"`);
            break;
          }
        }
      }
    } else {
      errors.push(`Failed to set value for: ${field.matchType}="${field.selector}"`);
      allFieldsSuccessful = false;
    }
  }

  // Execute rule-level postActions chain if all fields were successful
  // Stop the chain if any action fails
  if (allFieldsSuccessful && rule.postActions && rule.postActions.length > 0) {
    for (const action of rule.postActions) {
      const actionSuccess = await executePostAction(action);
      if (!actionSuccess) {
        errors.push(`Rule PostAction chain stopped: ${action.type} failed`);
        break;
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
chrome.runtime.onMessage.addListener((message: ExtensionMessage & { rule?: FillRule; settings?: FABSettings }, _sender, sendResponse) => {
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

  // Handle FAB settings update
  if ((message as { type: string }).type === 'FAB_SETTINGS_UPDATED' && (message as { settings: FABSettings }).settings) {
    currentSettings = (message as { settings: FABSettings }).settings;
    if (currentSettings.enabled) {
      showFAB();
      updateFABPosition();
    } else {
      hideFAB();
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FAB Functions
// ─────────────────────────────────────────────────────────────────────────────

// Create the FAB container with Shadow DOM
function createFAB(): void {
  if (fabContainer) return;

  // Create container
  fabContainer = document.createElement('div');
  fabContainer.id = 'slime-fab-container';
  
  // Create shadow root for style isolation
  fabShadowRoot = fabContainer.attachShadow({ mode: 'closed' });
  
  // Add styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = FAB_STYLES;
  fabShadowRoot.appendChild(styleSheet);
  
  // Create FAB button
  fabButton = document.createElement('button');
  fabButton.className = 'slime-fab';
  fabButton.innerHTML = `<img src="${SLIME_LOGO_URL}" alt="Slime" class="slime-fab-icon" />`;
  fabButton.title = 'Slime - Click to fill, drag to move';
  fabShadowRoot.appendChild(fabButton);
  
  // Create popup container (hidden by default)
  miniPopup = document.createElement('div');
  miniPopup.className = 'slime-popup';
  fabShadowRoot.appendChild(miniPopup);
  
  // Add to document
  document.body.appendChild(fabContainer);
  
  // Setup event listeners
  setupFABEvents();
}

// Setup FAB event listeners
function setupFABEvents(): void {
  if (!fabButton) return;

  let hasMoved = false;

  // Mouse down - start potential drag
  fabButton.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return; // Only left click
    
    hasMoved = false;
    
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    
    const rect = fabButton!.getBoundingClientRect();
    fabStartX = rect.right;
    fabStartY = rect.bottom;
    
    fabButton!.classList.add('dragging');
    
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
    
    e.preventDefault();
  });

  // Click handler (fires after mouseup if not dragged)
  fabButton.addEventListener('click', async (e) => {
    // If dragged, don't trigger click
    if (hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Left click - check for default rule or show popup
    await handleFABClick();
  });

  // Right click - always show popup
  fabButton.addEventListener('contextmenu', async (e) => {
    e.preventDefault();
    await showMiniPopup();
  });

  // Handle drag
  function handleDrag(e: MouseEvent): void {
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    
    // Only start dragging if moved more than 5px
    if (!isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      isDragging = true;
      hasMoved = true;
      hideMiniPopup();
    }
    
    if (isDragging && fabButton) {
      const newX = fabStartX + dx;
      const newY = fabStartY + dy;
      
      // Convert to percentage from right/bottom
      const xPercent = ((window.innerWidth - newX) / window.innerWidth) * 100;
      const yPercent = ((window.innerHeight - newY) / window.innerHeight) * 100;
      
      // Clamp to screen bounds
      const clampedX = Math.max(2, Math.min(98, xPercent));
      const clampedY = Math.max(2, Math.min(98, yPercent));
      
      fabButton.style.right = `${clampedX}%`;
      fabButton.style.bottom = `${clampedY}%`;
    }
  }

  // Handle drag end
  function handleDragEnd(): void {
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', handleDragEnd);
    
    fabButton?.classList.remove('dragging');
    
    if (isDragging && fabButton) {
      // Save new position
      const style = fabButton.style;
      const x = parseFloat(style.right) || 5;
      const y = parseFloat(style.bottom) || 10;
      
      saveFABPosition(x, y);
    }
    
    isDragging = false;
  }

  // Close popup when clicking outside
  document.addEventListener('click', (e) => {
    if (miniPopup?.classList.contains('visible')) {
      const target = e.target as Node;
      if (!fabContainer?.contains(target)) {
        hideMiniPopup();
      }
    }
  });

  // Close popup on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && miniPopup?.classList.contains('visible')) {
      hideMiniPopup();
    }
  });
}

// Handle FAB left click
async function handleFABClick(): Promise<void> {
  try {
    // Check for default rule
    const response = await chrome.runtime.sendMessage({
      type: 'GET_DEFAULT_RULE',
      url: window.location.href,
    });

    if (response?.rule) {
      // Fill with default rule
      const result = await fillForm(response.rule);
      if (result.errors.length > 0) {
        console.warn('[Slime] Fill errors:', result.errors);
      }
    } else {
      // No default rule - show popup
      await showMiniPopup();
    }
  } catch (error) {
    console.error('[Slime] Error handling FAB click:', error);
    await showMiniPopup();
  }
}

// Show the mini popup
async function showMiniPopup(): Promise<void> {
  if (!miniPopup || !fabButton) return;

  // Position popup relative to FAB
  const fabRect = fabButton.getBoundingClientRect();
  const popupWidth = 288; // Match the CSS width
  const popupGap = 12;
  
  // Determine if popup should appear above/below and left/right of FAB
  const spaceBelow = window.innerHeight - fabRect.bottom;
  const spaceAbove = fabRect.top;
  const spaceRight = window.innerWidth - fabRect.right;
  const spaceLeft = fabRect.left;
  
  // Horizontal positioning
  if (spaceRight >= popupWidth + popupGap) {
    // Position to the right of FAB
    miniPopup.style.left = `${fabRect.right + popupGap}px`;
    miniPopup.style.right = 'auto';
  } else if (spaceLeft >= popupWidth + popupGap) {
    // Position to the left of FAB
    miniPopup.style.right = `${window.innerWidth - fabRect.left + popupGap}px`;
    miniPopup.style.left = 'auto';
  } else {
    // Center horizontally
    miniPopup.style.left = `${Math.max(8, (window.innerWidth - popupWidth) / 2)}px`;
    miniPopup.style.right = 'auto';
  }

  // Vertical positioning
  if (spaceBelow >= 320) {
    miniPopup.style.top = `${fabRect.bottom + popupGap}px`;
    miniPopup.style.bottom = 'auto';
  } else if (spaceAbove >= 320) {
    miniPopup.style.bottom = `${window.innerHeight - fabRect.top + popupGap}px`;
    miniPopup.style.top = 'auto';
  } else {
    // Default to below with scroll
    miniPopup.style.top = `${fabRect.bottom + popupGap}px`;
    miniPopup.style.bottom = 'auto';
  }

  // Show loading state
  miniPopup.innerHTML = `
    <div class="slime-popup-header">
      <span class="slime-popup-title">Slime</span>
      <button class="slime-popup-settings" title="Settings">${SETTINGS_ICON_SVG}</button>
    </div>
    <div class="slime-loading">
      <div class="slime-spinner"></div>
    </div>
  `;
  
  miniPopup.classList.add('visible');
  
  // Setup settings button
  const settingsBtn = miniPopup.querySelector('.slime-popup-settings');
  settingsBtn?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS' });
    hideMiniPopup();
  });

  try {
    // Get rules for current URL
    const response = await chrome.runtime.sendMessage({
      type: 'GET_RULES_FOR_URL',
      url: window.location.href,
    });

    const rules: FillRule[] = response?.rules ?? [];
    const activeDefaultId: string | null = response?.activeDefaultId ?? null;

    renderPopupContent(rules, activeDefaultId);
  } catch (error) {
    console.error('[Slime] Error loading rules:', error);
    renderPopupContent([], null);
  }
}

// Render popup content with rules (matches main popup style)
function renderPopupContent(rules: FillRule[], activeDefaultId: string | null): void {
  if (!miniPopup) return;

  const header = `
    <div class="slime-popup-header">
      <span class="slime-popup-title">Slime</span>
      <button class="slime-popup-settings" title="Manage Rules">${SETTINGS_ICON_SVG}</button>
    </div>
  `;

  if (rules.length === 0) {
    miniPopup.innerHTML = `
      ${header}
      <div class="slime-no-rules">
        <p class="slime-no-rules-text">No rules for this page</p>
        <button class="slime-create-link">+ Create a rule</button>
      </div>
    `;
  } else {
    // 2-column grid matching main popup
    const ruleButtons = rules.map((rule) => {
      const isDefault = activeDefaultId === rule.id;
      const starBadge = isDefault ? `<span class="slime-star-badge">${STAR_OUTLINE_SVG}</span>` : '';
      return `
        <button class="slime-rule-btn ${isDefault ? 'default' : ''}" 
                data-rule-id="${rule.id}" 
                data-url-pattern="${encodeURIComponent(rule.urlPattern)}">
          ${starBadge}
          ${escapeHtml(rule.name)}
        </button>
      `;
    }).join('');

    miniPopup.innerHTML = `
      ${header}
      <div class="slime-rule-grid">${ruleButtons}</div>
    `;
  }

  // Setup event listeners
  setupPopupEvents(rules, activeDefaultId);
}

// Setup popup event listeners
function setupPopupEvents(rules: FillRule[], activeDefaultId: string | null): void {
  if (!miniPopup) return;

  // Settings button
  const settingsBtn = miniPopup.querySelector('.slime-popup-settings');
  settingsBtn?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS' });
    hideMiniPopup();
  });

  // Create rule link
  const createLink = miniPopup.querySelector('.slime-create-link');
  createLink?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS' });
    hideMiniPopup();
  });

  // Rule buttons - left click to fill, right click for context menu
  const ruleButtons = miniPopup.querySelectorAll('.slime-rule-btn');
  ruleButtons.forEach((btn) => {
    const ruleId = btn.getAttribute('data-rule-id');
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;

    // Left click - fill form
    btn.addEventListener('click', async () => {
      // Show loading state
      btn.classList.add('loading');
      const originalContent = btn.innerHTML;
      btn.innerHTML = '<div class="slime-spinner"></div>';

      try {
        const result = await fillForm(rule);
        if (result.errors.length === 0) {
          hideMiniPopup();
        } else {
          console.warn('[Slime] Fill errors:', result.errors);
          btn.innerHTML = originalContent;
          btn.classList.remove('loading');
        }
      } catch {
        btn.innerHTML = originalContent;
        btn.classList.remove('loading');
      }
    });

    // Right click - context menu for setting default
    btn.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showRuleContextMenu(rule, activeDefaultId, e as MouseEvent, rules);
    });
  });
}

// Show context menu for a rule (set/unset default)
function showRuleContextMenu(
  rule: FillRule, 
  activeDefaultId: string | null, 
  event: MouseEvent,
  allRules: FillRule[]
): void {
  if (!miniPopup) return;

  // Remove any existing context menu
  const existingMenu = miniPopup.querySelector('.slime-context-menu');
  existingMenu?.remove();

  // Get popup position to calculate relative coordinates
  const popupRect = miniPopup.getBoundingClientRect();
  const menuX = event.clientX - popupRect.left;
  const menuY = event.clientY - popupRect.top;

  const isDefault = activeDefaultId === rule.id;
  const menuHtml = `
    <div class="slime-context-menu" style="left: ${menuX}px; top: ${menuY}px;">
      <button class="slime-context-item ${isDefault ? 'active' : ''}" data-action="toggle-default">
        ${STAR_OUTLINE_SVG}
        ${isDefault ? 'Remove as default' : 'Set as default'}
      </button>
    </div>
  `;

  // Insert menu into popup
  miniPopup.insertAdjacentHTML('beforeend', menuHtml);

  const menu = miniPopup.querySelector('.slime-context-menu') as HTMLElement;
  const toggleBtn = menu?.querySelector('[data-action="toggle-default"]');

  toggleBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    menu?.remove();
    
    if (isDefault) {
      // Remove default
      showConfirmDialog(
        `Remove "${rule.name}" as default for this URL pattern?`,
        null,
        async () => {
          await chrome.runtime.sendMessage({
            type: 'REMOVE_DEFAULT_RULE',
            urlPattern: rule.urlPattern,
          });
          await showMiniPopup();
        }
      );
    } else {
      // Set as default
      const existingDefault = allRules.find((r) => r.id === activeDefaultId);
      const warningText = existingDefault 
        ? `This will replace "${existingDefault.name}" as the default.`
        : null;
      
      showConfirmDialog(
        `Set "${rule.name}" as default for pattern: ${rule.urlPattern}?`,
        warningText,
        async () => {
          await chrome.runtime.sendMessage({
            type: 'SET_DEFAULT_RULE',
            urlPattern: rule.urlPattern,
            ruleId: rule.id,
          });
          await showMiniPopup();
        }
      );
    }
  });

  // Close menu when clicking elsewhere
  const closeMenu = (e: MouseEvent) => {
    if (!menu?.contains(e.target as Node)) {
      menu?.remove();
      document.removeEventListener('click', closeMenu);
    }
  };
  setTimeout(() => document.addEventListener('click', closeMenu), 0);
}

// Show confirmation dialog
function showConfirmDialog(
  message: string,
  warning: string | null,
  onConfirm: () => void
): void {
  if (!miniPopup) return;

  const warningHtml = warning 
    ? `<div class="slime-confirm-warning">${escapeHtml(warning)}</div>` 
    : '';

  miniPopup.innerHTML = `
    <div class="slime-popup-header">
      <span class="slime-popup-title">Confirm</span>
    </div>
    <div class="slime-confirm-dialog">
      <div class="slime-confirm-text">${escapeHtml(message)}</div>
      ${warningHtml}
      <div class="slime-confirm-buttons">
        <button class="slime-btn slime-btn-cancel">Cancel</button>
        <button class="slime-btn slime-btn-confirm">Confirm</button>
      </div>
    </div>
  `;

  const cancelBtn = miniPopup.querySelector('.slime-btn-cancel');
  const confirmBtn = miniPopup.querySelector('.slime-btn-confirm');

  cancelBtn?.addEventListener('click', () => {
    showMiniPopup(); // Go back to rule list
  });

  confirmBtn?.addEventListener('click', () => {
    onConfirm();
  });
}

// Hide the mini popup
function hideMiniPopup(): void {
  miniPopup?.classList.remove('visible');
}

// Update FAB position from settings
function updateFABPosition(): void {
  if (!fabButton || !currentSettings) return;
  
  fabButton.style.right = `${currentSettings.position.x}%`;
  fabButton.style.bottom = `${currentSettings.position.y}%`;
}

// Save FAB position
async function saveFABPosition(x: number, y: number): Promise<void> {
  if (!currentSettings) return;
  
  const newSettings: FABSettings = {
    ...currentSettings,
    position: { x, y },
  };
  
  await chrome.runtime.sendMessage({
    type: 'SAVE_FAB_SETTINGS',
    settings: newSettings,
  });
  
  currentSettings = newSettings;
}

// Show the FAB
function showFAB(): void {
  if (!fabContainer) {
    createFAB();
  }
  if (fabContainer) {
    fabContainer.style.display = 'block';
  }
}

// Hide the FAB
function hideFAB(): void {
  if (fabContainer) {
    fabContainer.style.display = 'none';
  }
  hideMiniPopup();
}

// Escape HTML for safe rendering
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ─────────────────────────────────────────────────────────────────────────────
// Initialization
// ─────────────────────────────────────────────────────────────────────────────

// Initialize FAB on page load
async function initializeFAB(): Promise<void> {
  try {
    // Get FAB settings from background
    const response = await chrome.runtime.sendMessage({ type: 'GET_FAB_SETTINGS' });
    
    if (response?.settings) {
      currentSettings = response.settings;
      
      if (currentSettings?.enabled) {
        showFAB();
        updateFABPosition();
      }
    }
  } catch (error) {
    console.error('[Slime] Error initializing FAB:', error);
  }
}

// Start initialization when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFAB);
} else {
  initializeFAB();
}

// ─────────────────────────────────────────────────────────────────────────────
// Keyboard Shortcuts
// ─────────────────────────────────────────────────────────────────────────────

// Configurable keyboard shortcut to fill with default rule
document.addEventListener('keydown', async (e) => {
  // Get current shortcut settings
  const shortcut = currentSettings?.shortcut ?? { modifier: 'ctrl', key: 'q' };

  // Check modifier key
  let modifierPressed = false;
  switch (shortcut.modifier) {
    case 'ctrl':
      modifierPressed = e.ctrlKey || e.metaKey; // metaKey for Mac
      break;
    case 'shift':
      modifierPressed = e.shiftKey;
      break;
    case 'alt':
      modifierPressed = e.altKey;
      break;
  }

  if (!modifierPressed) return;

  // Check the key (case insensitive)
  const keyPressed = e.key.toLowerCase() === shortcut.key.toLowerCase() || 
                     e.code === `Key${shortcut.key.toUpperCase()}`;

  if (!keyPressed) return;

  e.preventDefault();
  e.stopPropagation();

  try {
    // Get default rule for current URL
    const response = await chrome.runtime.sendMessage({
      type: 'GET_DEFAULT_RULE',
      url: window.location.href,
    });

    if (response?.rule) {
      const result = await fillForm(response.rule);
      if (result.errors.length > 0) {
        console.warn('[Slime] Fill errors:', result.errors);
      }
    } else {
      // No default rule - show popup (same as FAB click)
      await showMiniPopup();
    }
  } catch (error) {
    console.error('[Slime] Error filling with shortcut:', error);
    await showMiniPopup();
  }
}, true); // Use capture phase to catch event early

// Log that content script is loaded (for debugging)
console.log('[Slime] Content script loaded');

