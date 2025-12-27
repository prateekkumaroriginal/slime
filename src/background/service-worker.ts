import { getRule, updateIncrement } from '@/storage/rules';

// Message types
interface FillFormRequest {
  type: 'FILL_FORM';
  ruleId: string;
}

interface UpdateIncrementRequest {
  type: 'UPDATE_INCREMENT';
  ruleId: string;
  newValue: number;
}

type ServiceWorkerMessage = FillFormRequest | UpdateIncrementRequest;

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message: ServiceWorkerMessage, _sender, sendResponse) => {
  if (message.type === 'FILL_FORM') {
    handleFillForm(message.ruleId, sendResponse);
    return true; // Keep channel open for async
  }

  if (message.type === 'UPDATE_INCREMENT') {
    handleUpdateIncrement(message.ruleId, message.newValue);
    return false;
  }
});

// Handle fill form request from popup
async function handleFillForm(ruleId: string, sendResponse: (response: unknown) => void) {
  try {
    const rule = await getRule(ruleId);

    if (!rule) {
      sendResponse({ success: false, error: 'Rule not found' });
      return;
    }

    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) {
      sendResponse({ success: false, error: 'No active tab' });
      return;
    }

    // Send message to content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'FILL_FORM',
      rule,
    });

    sendResponse(response);
  } catch (error) {
    sendResponse({ success: false, error: String(error) });
  }
}

// Handle increment update from content script
async function handleUpdateIncrement(ruleId: string, newValue: number) {
  try {
    await updateIncrement(ruleId, newValue);
  } catch (error) {
    console.error('[Form Filler] Failed to update increment:', error);
  }
}

// Log that service worker is loaded
console.log('[Form Filler] Service worker loaded');

