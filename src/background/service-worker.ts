import { 
  getRule, 
  updateIncrement, 
  getFABSettings, 
  saveFABSettings, 
  resetFABPosition,
  getDefaultRuleForUrl,
  setDefaultRuleForUrl,
  removeDefaultRuleForUrl,
  getRulesForUrl,
  getActiveDefaultRuleId,
  getDefaultRuleMappings,
  getRules,
  getImage
} from '@/storage/rules';
import type {
  CloseCurrentTabMessage,
  DefaultRuleMapping,
  FABSettings,
  FillRule,
  UpdateIncrementMessage,
} from '@/shared/types';

// Message types
interface FillFormRequest {
  type: 'FILL_FORM';
  ruleId: string;
}

interface GetFABSettingsRequest {
  type: 'GET_FAB_SETTINGS';
}

interface SaveFABSettingsRequest {
  type: 'SAVE_FAB_SETTINGS';
  settings: FABSettings;
}

interface ResetFABPositionRequest {
  type: 'RESET_FAB_POSITION';
}

interface GetDefaultRuleRequest {
  type: 'GET_DEFAULT_RULE';
  url: string;
}

interface SetDefaultRuleRequest {
  type: 'SET_DEFAULT_RULE';
  urlPattern: string;
  ruleId: string;
}

interface RemoveDefaultRuleRequest {
  type: 'REMOVE_DEFAULT_RULE';
  urlPattern: string;
}

interface GetRulesForUrlRequest {
  type: 'GET_RULES_FOR_URL';
  url: string;
}

interface GetAllDefaultMappingsRequest {
  type: 'GET_ALL_DEFAULT_MAPPINGS';
}

interface OpenOptionsRequest {
  type: 'OPEN_OPTIONS';
}

interface GetImageRequest {
  type: 'GET_IMAGE';
  imageId: string;
}

type ServiceWorkerMessage = 
  | FillFormRequest 
  | UpdateIncrementMessage
  | CloseCurrentTabMessage
  | GetFABSettingsRequest
  | SaveFABSettingsRequest
  | ResetFABPositionRequest
  | GetDefaultRuleRequest
  | SetDefaultRuleRequest
  | RemoveDefaultRuleRequest
  | GetRulesForUrlRequest
  | GetAllDefaultMappingsRequest
  | OpenOptionsRequest
  | GetImageRequest;

const CLOSE_TAB_ALARM_PREFIX = 'slime-close-tab:';
const MAX_CLOSE_DELAY_MS = 2_147_483_647;
const scheduledTabCloseTimers = new Map<string, ReturnType<typeof setTimeout>>();

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message: ServiceWorkerMessage, sender, sendResponse) => {
  switch (message.type) {
    case 'FILL_FORM':
      handleFillForm(message.ruleId, sendResponse);
      return true;

    case 'UPDATE_INCREMENT':
      handleUpdateIncrement(message.ruleId, message.newValue, sendResponse);
      return true;

    case 'CLOSE_CURRENT_TAB': {
      const tabId = sender.tab?.id;
      if (tabId === undefined) {
        sendResponse({ success: false, error: 'No sender tab' });
        return false;
      }

      const delayMs = normalizeCloseDelay(message.delayMs);
      if (delayMs > 0) {
        scheduleTabClose(tabId, delayMs);
        sendResponse({ success: true });
        return false;
      }

      sendResponse({ success: true });
      void closeTab(tabId);
      return false;
    }

    case 'GET_FAB_SETTINGS':
      handleGetFABSettings(sendResponse);
      return true;

    case 'SAVE_FAB_SETTINGS':
      handleSaveFABSettings(message.settings, sendResponse);
      return true;

    case 'RESET_FAB_POSITION':
      handleResetFABPosition(sendResponse);
      return true;

    case 'GET_DEFAULT_RULE':
      handleGetDefaultRule(message.url, sendResponse);
      return true;

    case 'SET_DEFAULT_RULE':
      handleSetDefaultRule(message.urlPattern, message.ruleId, sendResponse);
      return true;

    case 'REMOVE_DEFAULT_RULE':
      handleRemoveDefaultRule(message.urlPattern, sendResponse);
      return true;

    case 'GET_RULES_FOR_URL':
      handleGetRulesForUrl(message.url, sendResponse);
      return true;

    case 'GET_ALL_DEFAULT_MAPPINGS':
      handleGetAllDefaultMappings(sendResponse);
      return true;

    case 'OPEN_OPTIONS':
      chrome.runtime.openOptionsPage();
      return false;

    case 'GET_IMAGE':
      handleGetImage(message.imageId, sendResponse);
      return true;

    default:
      return false;
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (!alarm.name.startsWith(CLOSE_TAB_ALARM_PREFIX)) return;

  const tabId = getTabIdFromCloseAlarm(alarm.name);
  if (tabId === null) return;

  const timer = scheduledTabCloseTimers.get(alarm.name);
  if (timer !== undefined) {
    clearTimeout(timer);
    scheduledTabCloseTimers.delete(alarm.name);
  }

  void closeTab(tabId);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  void clearScheduledTabCloses(tabId);
});

chrome.runtime.onStartup.addListener(() => {
  void clearAllScheduledTabCloses();
});

chrome.runtime.onInstalled.addListener(() => {
  void clearAllScheduledTabCloses();
});

function normalizeCloseDelay(delayMs: number): number {
  if (!Number.isFinite(delayMs)) return 0;
  return Math.min(MAX_CLOSE_DELAY_MS, Math.max(0, Math.floor(delayMs)));
}

function getCloseAlarmPrefixForTab(tabId: number): string {
  return `${CLOSE_TAB_ALARM_PREFIX}${tabId}:`;
}

function getTabIdFromCloseAlarm(alarmName: string): number | null {
  const encodedTabId = alarmName.slice(CLOSE_TAB_ALARM_PREFIX.length).split(':', 1)[0];
  const tabId = Number(encodedTabId);
  return Number.isSafeInteger(tabId) && tabId >= 0 ? tabId : null;
}

function scheduleTabClose(tabId: number, delayMs: number): void {
  const alarmName = `${getCloseAlarmPrefixForTab(tabId)}${crypto.randomUUID()}`;
  const closeAt = Date.now() + delayMs;

  const timer = setTimeout(() => {
    scheduledTabCloseTimers.delete(alarmName);
    void chrome.alarms.clear(alarmName);
    void closeTab(tabId);
  }, delayMs);
  scheduledTabCloseTimers.set(alarmName, timer);

  // The timer provides precise short delays. The alarm survives service-worker
  // suspension and acts as a durable fallback, although Chrome may delay it.
  void chrome.alarms.create(alarmName, {
    when: closeAt,
  }).catch((error: unknown) => {
    console.error(`[Slime] Failed to create close alarm for tab ${tabId}:`, error);
  });
}

async function clearAllScheduledTabCloses(): Promise<void> {
  for (const timer of scheduledTabCloseTimers.values()) {
    clearTimeout(timer);
  }
  scheduledTabCloseTimers.clear();

  const alarms = await chrome.alarms.getAll();
  await Promise.all(
    alarms
      .filter((alarm) => alarm.name.startsWith(CLOSE_TAB_ALARM_PREFIX))
      .map((alarm) => chrome.alarms.clear(alarm.name))
  );
}

async function clearScheduledTabCloses(tabId: number): Promise<void> {
  const alarmPrefix = getCloseAlarmPrefixForTab(tabId);

  for (const [alarmName, timer] of scheduledTabCloseTimers) {
    if (!alarmName.startsWith(alarmPrefix)) continue;
    clearTimeout(timer);
    scheduledTabCloseTimers.delete(alarmName);
  }

  const alarms = await chrome.alarms.getAll();
  await Promise.all(
    alarms
      .filter((alarm) => alarm.name.startsWith(alarmPrefix))
      .map((alarm) => chrome.alarms.clear(alarm.name))
  );
}

async function closeTab(tabId: number): Promise<void> {
  try {
    await chrome.tabs.remove(tabId);
  } catch (error) {
    console.error(`[Slime] Failed to close sender tab ${tabId}:`, error);
  }
}

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
async function handleUpdateIncrement(
  ruleId: string,
  newValue: number,
  sendResponse: (response: unknown) => void
) {
  try {
    await updateIncrement(ruleId, newValue);
    sendResponse({ success: true });
  } catch (error) {
    console.error('[Slime] Failed to update increment:', error);
    sendResponse({ success: false, error: String(error) });
  }
}

// Handle get FAB settings
async function handleGetFABSettings(sendResponse: (response: unknown) => void) {
  try {
    const settings = await getFABSettings();
    sendResponse({ settings });
  } catch (error) {
    console.error('[Slime] Failed to get FAB settings:', error);
    sendResponse({ settings: null, error: String(error) });
  }
}

// Handle save FAB settings
async function handleSaveFABSettings(settings: FABSettings, sendResponse: (response: unknown) => void) {
  try {
    await saveFABSettings(settings);
    
    // Notify all tabs about the settings update
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'FAB_SETTINGS_UPDATED',
            settings,
          });
        } catch {
          // Tab might not have content script, ignore
        }
      }
    }
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('[Slime] Failed to save FAB settings:', error);
    sendResponse({ success: false, error: String(error) });
  }
}

// Handle reset FAB position
async function handleResetFABPosition(sendResponse: (response: unknown) => void) {
  try {
    const settings = await resetFABPosition();
    
    // Notify all tabs about the settings update
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'FAB_SETTINGS_UPDATED',
            settings,
          });
        } catch {
          // Tab might not have content script, ignore
        }
      }
    }
    
    sendResponse({ success: true, settings });
  } catch (error) {
    console.error('[Slime] Failed to reset FAB position:', error);
    sendResponse({ success: false, error: String(error) });
  }
}

// Handle get default rule for URL
async function handleGetDefaultRule(url: string, sendResponse: (response: unknown) => void) {
  try {
    const result = await getDefaultRuleForUrl(url);
    sendResponse({ 
      rule: result?.rule ?? null, 
      mapping: result?.mapping ?? null 
    });
  } catch (error) {
    console.error('[Slime] Failed to get default rule:', error);
    sendResponse({ rule: null, mapping: null, error: String(error) });
  }
}

// Handle set default rule
async function handleSetDefaultRule(urlPattern: string, ruleId: string, sendResponse: (response: unknown) => void) {
  try {
    await setDefaultRuleForUrl(urlPattern, ruleId);
    sendResponse({ success: true });
  } catch (error) {
    console.error('[Slime] Failed to set default rule:', error);
    sendResponse({ success: false, error: String(error) });
  }
}

// Handle remove default rule
async function handleRemoveDefaultRule(urlPattern: string, sendResponse: (response: unknown) => void) {
  try {
    await removeDefaultRuleForUrl(urlPattern);
    sendResponse({ success: true });
  } catch (error) {
    console.error('[Slime] Failed to remove default rule:', error);
    sendResponse({ success: false, error: String(error) });
  }
}

// Handle get rules for URL
async function handleGetRulesForUrl(url: string, sendResponse: (response: unknown) => void) {
  try {
    const rules = await getRulesForUrl(url);
    const activeDefaultId = await getActiveDefaultRuleId(url);
    sendResponse({ rules, activeDefaultId });
  } catch (error) {
    console.error('[Slime] Failed to get rules for URL:', error);
    sendResponse({ rules: [], activeDefaultId: null, error: String(error) });
  }
}

// Handle get all default mappings (with rule names for display)
async function handleGetAllDefaultMappings(sendResponse: (response: unknown) => void) {
  try {
    const mappings = await getDefaultRuleMappings();
    const rules = await getRules();
    
    // Enrich mappings with rule names
    const enrichedMappings: (DefaultRuleMapping & { ruleName: string })[] = mappings.map((mapping) => {
      const rule = rules.find((r: FillRule) => r.id === mapping.ruleId);
      return {
        ...mapping,
        ruleName: rule?.name ?? 'Unknown Rule',
      };
    });
    
    sendResponse({ mappings: enrichedMappings });
  } catch (error) {
    console.error('[Slime] Failed to get default mappings:', error);
    sendResponse({ mappings: [], error: String(error) });
  }
}

// Handle get image request from content script
async function handleGetImage(imageId: string, sendResponse: (response: unknown) => void) {
  try {
    const image = await getImage(imageId);
    sendResponse({ image });
  } catch (error) {
    console.error('[Slime] Failed to get image:', error);
    sendResponse({ image: null, error: String(error) });
  }
}

// Log that service worker is loaded
console.log('[Slime] Service worker loaded');
