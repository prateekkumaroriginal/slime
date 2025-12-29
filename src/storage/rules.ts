import type { FillRule, StorageData } from '@/shared/types';

const STORAGE_KEY = 'formFillerData';

// Get all rules from storage
export async function getRules(): Promise<FillRule[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const data = result[STORAGE_KEY] as StorageData | undefined;
  return data?.rules ?? [];
}

// Save all rules to storage
export async function saveRules(rules: FillRule[]): Promise<void> {
  const data: StorageData = { rules };
  await chrome.storage.local.set({ [STORAGE_KEY]: data });
}

// Get a single rule by ID
export async function getRule(id: string): Promise<FillRule | undefined> {
  const rules = await getRules();
  return rules.find((r) => r.id === id);
}

// Add a new rule
export async function addRule(rule: FillRule): Promise<void> {
  const rules = await getRules();
  rules.push(rule);
  await saveRules(rules);
}

// Update an existing rule
export async function updateRule(updatedRule: FillRule): Promise<void> {
  const rules = await getRules();
  const index = rules.findIndex((r) => r.id === updatedRule.id);
  if (index !== -1) {
    rules[index] = { ...updatedRule, updatedAt: Date.now() };
    await saveRules(rules);
  }
}

// Delete a rule by ID
export async function deleteRule(id: string): Promise<void> {
  const rules = await getRules();
  const filtered = rules.filter((r) => r.id !== id);
  await saveRules(filtered);
}

// Toggle rule enabled state
export async function toggleRule(id: string): Promise<void> {
  const rules = await getRules();
  const rule = rules.find((r) => r.id === id);
  if (rule) {
    rule.enabled = !rule.enabled;
    rule.updatedAt = Date.now();
    await saveRules(rules);
  }
}

// Update increment counter for a rule
export async function updateIncrement(id: string, newValue: number): Promise<void> {
  const rules = await getRules();
  const rule = rules.find((r) => r.id === id);
  if (rule) {
    rule.incrementCounter = newValue;
    await saveRules(rules);
  }
}

// Reset increment counter for a rule
export async function resetIncrement(id: string): Promise<void> {
  await updateIncrement(id, 0);
}

// Get rules matching a URL
export function matchesUrl(pattern: string, url: string): boolean {
  // Handle wildcard patterns like "*://example.com/*"
  if (pattern === '*' || pattern === '<all_urls>') {
    return true;
  }

  try {
    // Convert Chrome extension URL pattern to regex
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
      .replace(/\\\*/g, '.*'); // Convert * to .*

    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(url);
  } catch {
    return false;
  }
}

// Get rules that match a specific URL
export async function getRulesForUrl(url: string): Promise<FillRule[]> {
  const rules = await getRules();
  return rules.filter((rule) => rule.enabled && matchesUrl(rule.urlPattern, url));
}

// Generate a unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Create a new empty rule
export function createEmptyRule(): FillRule {
  const now = Date.now();
  return {
    id: generateId(),
    name: '',
    urlPattern: '*',
    fields: [],
    enabled: true,
    incrementCounter: 1,
    createdAt: now,
    updatedAt: now,
  };
}

// Export all rules as JSON string
export async function exportRulesToJson(): Promise<string> {
  const rules = await getRules();
  return JSON.stringify({ rules, exportedAt: Date.now(), version: 1 }, null, 2);
}

// Import rules from JSON, adding them to existing rules
export async function importRulesFromJson(jsonString: string): Promise<number> {
  const data = JSON.parse(jsonString);
  const importedRules: FillRule[] = data.rules;

  // Validate and generate new IDs to avoid conflicts
  const existingRules = await getRules();
  const now = Date.now();

  const newRules = importedRules.map(rule => ({
    ...rule,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }));

  await saveRules([...existingRules, ...newRules]);
  return newRules.length;
}

