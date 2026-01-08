import { z } from 'zod';
import type { FillRule, StorageData, FABSettings, DefaultRuleMapping, DefaultRulesData } from '@/shared/types';
import { STORAGE_KEY, CURRENT_VERSION, SUPPORTED_VERSIONS, FAB_SETTINGS_KEY, DEFAULT_RULES_KEY, DEFAULT_FAB_SETTINGS } from '@/shared/config';

// ─────────────────────────────────────────────────────────────────────────────
// Zod Schema for Import Validation (with custom error messages)
// ─────────────────────────────────────────────────────────────────────────────

const PostActionSchema = z.object({
  id: z.string({ message: 'PostAction id must be a string' }),
  type: z.enum(['click', 'focus', 'pressKey', 'wait'], { message: 'PostAction type must be "click", "focus", "pressKey", or "wait"' }),
  selector: z.string({ message: 'PostAction selector must be a string' }).optional(),
  key: z.string({ message: 'PostAction key must be a string' }).optional(),
  delay: z.number({ message: 'PostAction delay must be a number' }).optional(),
});

const FieldMappingSchema = z.object({
  id: z.string({ message: 'Field id must be a string' }),
  selector: z.string({ message: 'Field selector must be a string' }),
  matchType: z.enum(['id', 'name', 'querySelector'], { message: 'matchType must be "id", "name", or "querySelector"' }),
  valueType: z.enum(['static', 'template'], { message: 'valueType must be "static" or "template"' }),
  value: z.string({ message: 'Field value must be a string' }),
  postAction: PostActionSchema.optional(),
});

const FillRuleSchema = z.object({
  name: z.string({ message: 'Rule name must be a string' }),
  urlPattern: z.string({ message: 'urlPattern must be a string' }),
  fields: z.array(FieldMappingSchema, { message: 'fields must be an array' }),
  enabled: z.boolean({ message: 'enabled must be a boolean' }),
  incrementCounter: z.number({ message: 'incrementCounter must be a number' }).optional(),
  postActions: z.array(PostActionSchema, { message: 'postActions must be an array' }).optional(),
});

const ImportSchema = z.object({
  version: z
    .number({ message: 'version must be a number' })
    .refine((v) => SUPPORTED_VERSIONS.includes(v as typeof SUPPORTED_VERSIONS[number]), {
      message: `Unsupported version. Supported: ${SUPPORTED_VERSIONS.join(', ')}`,
    }),
  rules: z.array(FillRuleSchema, { message: 'rules must be an array' }),
  exportedAt: z.number().optional(),
});

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
// Supports /regex/ syntax for raw regex patterns
export function matchesUrl(pattern: string, url: string): boolean {
  // Handle wildcard patterns like "*://example.com/*"
  if (pattern === '*' || pattern === '<all_urls>') {
    return true;
  }

  try {
    // Check for /regex/ syntax
    const regexMatch = pattern.match(/^\/(.+)\/$/);
    if (regexMatch) {
      // Use raw regex pattern
      const regex = new RegExp(regexMatch[1]);
      return regex.test(url);
    }

    // Convert Chrome extension URL pattern to regex (wildcard mode)
    const regexPattern = pattern
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars (including *)
      .replace(/\\\*/g, '.*'); // Convert escaped \* back to .*

    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(url);
  } catch {
    return false;
  }
}

// Get rules that match a specific URL
export async function getRulesForUrl(url: string): Promise<FillRule[]> {
  const rules = await getRules();
  return rules.filter((rule) => rule.enabled && !rule.isArchived && matchesUrl(rule.urlPattern, url));
}

// Get active (non-archived) rules
export async function getActiveRules(): Promise<FillRule[]> {
  const rules = await getRules();
  return rules.filter((rule) => !rule.isArchived);
}

// Get archived rules
export async function getArchivedRules(): Promise<FillRule[]> {
  const rules = await getRules();
  return rules.filter((rule) => rule.isArchived === true);
}

// Archive a rule by ID
export async function archiveRule(id: string): Promise<void> {
  const rules = await getRules();
  const rule = rules.find((r) => r.id === id);
  if (rule) {
    rule.isArchived = true;
    rule.updatedAt = Date.now();
    await saveRules(rules);
  }
}

// Restore an archived rule by ID
export async function restoreRule(id: string): Promise<void> {
  const rules = await getRules();
  const rule = rules.find((r) => r.id === id);
  if (rule) {
    rule.isArchived = false;
    rule.updatedAt = Date.now();
    await saveRules(rules);
  }
}

// Permanently delete a rule by ID (actually removes from storage)
export async function permanentlyDeleteRule(id: string): Promise<void> {
  const rules = await getRules();
  const filtered = rules.filter((r) => r.id !== id);
  await saveRules(filtered);
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
  return JSON.stringify({ rules, exportedAt: Date.now(), version: CURRENT_VERSION }, null, 2);
}

// Export a single rule as JSON string
export function exportSingleRuleToJson(rule: FillRule): string {
  return JSON.stringify({ rules: [rule], exportedAt: Date.now(), version: CURRENT_VERSION }, null, 2);
}

// Validation error for import
export class ImportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImportValidationError';
  }
}

// Format Zod errors into readable strings with paths
function formatZodErrors(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
    return `${path}: ${issue.message}`;
  });
}

// Import rules from JSON, adding them to existing rules
// Throws ImportValidationError if validation fails
// Returns the count of imported rules
export async function importRulesFromJson(jsonString: string): Promise<number> {
  // Parse JSON
  let rawData: unknown;
  try {
    rawData = JSON.parse(jsonString);
  } catch (parseError) {
    const message = parseError instanceof Error ? parseError.message : 'Unknown parse error';
    throw new ImportValidationError(`Invalid JSON: ${message}`);
  }

  // Validate entire structure in one call
  const result = ImportSchema.safeParse(rawData);

  if (!result.success) {
    const errors = formatZodErrors(result.error);
    console.error('[Slime Import] Validation failed:', errors);
    throw new ImportValidationError(errors.join('\n'));
  }

  const { rules: validatedRules } = result.data;

  if (validatedRules.length === 0) {
    return 0;
  }

  // Generate new IDs and timestamps
  const existingRules = await getRules();
  const now = Date.now();

  const newRules: FillRule[] = validatedRules.map((rule) => ({
    ...rule,
    id: generateId(),
    fields: rule.fields.map((f) => ({
      ...f,
      id: generateId(),
    })),
    incrementCounter: rule.incrementCounter ?? 1,
    createdAt: now,
    updatedAt: now,
  }));

  await saveRules([...existingRules, ...newRules]);
  return newRules.length;
}

// ─────────────────────────────────────────────────────────────────────────────
// FAB Settings Functions
// ─────────────────────────────────────────────────────────────────────────────

// Get FAB settings from storage
export async function getFABSettings(): Promise<FABSettings> {
  const result = await chrome.storage.local.get(FAB_SETTINGS_KEY);
  const stored = result[FAB_SETTINGS_KEY] as FABSettings | undefined;
  if (stored) {
    // Migrate old settings without shortcut
    if (!stored.shortcut) {
      stored.shortcut = { ...DEFAULT_FAB_SETTINGS.shortcut };
    }
    return stored;
  }
  return {
    enabled: DEFAULT_FAB_SETTINGS.enabled,
    position: { x: DEFAULT_FAB_SETTINGS.position.x, y: DEFAULT_FAB_SETTINGS.position.y },
    shortcut: { ...DEFAULT_FAB_SETTINGS.shortcut },
  };
}

// Save FAB settings to storage
export async function saveFABSettings(settings: FABSettings): Promise<void> {
  await chrome.storage.local.set({ [FAB_SETTINGS_KEY]: settings });
}

// Reset FAB position to default
export async function resetFABPosition(): Promise<FABSettings> {
  const settings = await getFABSettings();
  const updated: FABSettings = {
    ...settings,
    position: { ...DEFAULT_FAB_SETTINGS.position },
  };
  await saveFABSettings(updated);
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Rule Mapping Functions
// ─────────────────────────────────────────────────────────────────────────────

// Get all default rule mappings
export async function getDefaultRuleMappings(): Promise<DefaultRuleMapping[]> {
  const result = await chrome.storage.local.get(DEFAULT_RULES_KEY);
  const data = result[DEFAULT_RULES_KEY] as DefaultRulesData | undefined;
  return data?.mappings ?? [];
}

// Save all default rule mappings
async function saveDefaultRuleMappings(mappings: DefaultRuleMapping[]): Promise<void> {
  const data: DefaultRulesData = { mappings };
  await chrome.storage.local.set({ [DEFAULT_RULES_KEY]: data });
}

// Calculate URL pattern specificity score for priority matching
// Higher score = more specific pattern
export function calculatePatternSpecificity(pattern: string): number {
  // Wildcard patterns have lowest priority
  if (pattern === '*' || pattern === '<all_urls>') {
    return 0;
  }

  // Check for regex pattern
  if (pattern.match(/^\/(.+)\/$/)) {
    // Regex patterns get medium-high priority based on length
    return 300 + pattern.length;
  }

  let score = 0;

  // Has specific protocol (not *)
  if (!pattern.startsWith('*://')) {
    score += 100;
  }

  // Has specific domain (not just wildcards)
  const domainMatch = pattern.match(/:\/\/([^/]+)/);
  if (domainMatch) {
    const domain = domainMatch[1];
    if (!domain.startsWith('*')) {
      score += 200;
    }
    // More domain segments = more specific
    score += (domain.split('.').length - 1) * 10;
  }

  // Has path component
  const pathMatch = pattern.match(/:\/\/[^/]+(\/.*)/);
  if (pathMatch) {
    const path = pathMatch[1];
    // More path segments = more specific
    const segments = path.split('/').filter(Boolean);
    score += segments.length * 50;

    // Exact path (no wildcards) is most specific
    if (!path.includes('*')) {
      score += 500;
    }
  }

  return score;
}

// Get the default rule for a specific URL (finds highest priority matching pattern)
export async function getDefaultRuleForUrl(url: string): Promise<{ rule: FillRule; mapping: DefaultRuleMapping } | null> {
  const mappings = await getDefaultRuleMappings();
  const rules = await getRules();

  // Find all matching patterns with their rules
  const matches: { mapping: DefaultRuleMapping; rule: FillRule; score: number }[] = [];

  for (const mapping of mappings) {
    if (matchesUrl(mapping.urlPattern, url)) {
      const rule = rules.find((r) => r.id === mapping.ruleId);
      if (rule && rule.enabled && !rule.isArchived) {
        matches.push({
          mapping,
          rule,
          score: calculatePatternSpecificity(mapping.urlPattern),
        });
      }
    }
  }

  if (matches.length === 0) {
    return null;
  }

  // Sort by score descending and return highest priority
  matches.sort((a, b) => b.score - a.score);
  return { rule: matches[0].rule, mapping: matches[0].mapping };
}

// Set a rule as default for a URL pattern (replaces any existing default for that pattern)
export async function setDefaultRuleForUrl(urlPattern: string, ruleId: string): Promise<void> {
  const mappings = await getDefaultRuleMappings();

  // Remove any existing mapping for this pattern
  const filtered = mappings.filter((m) => m.urlPattern !== urlPattern);

  // Add new mapping
  filtered.push({ urlPattern, ruleId });

  await saveDefaultRuleMappings(filtered);
}

// Remove default rule for a URL pattern
export async function removeDefaultRuleForUrl(urlPattern: string): Promise<void> {
  const mappings = await getDefaultRuleMappings();
  const filtered = mappings.filter((m) => m.urlPattern !== urlPattern);
  await saveDefaultRuleMappings(filtered);
}

// Check if a rule is set as default for any pattern
export async function isRuleDefaultForPattern(ruleId: string, urlPattern: string): Promise<boolean> {
  const mappings = await getDefaultRuleMappings();
  return mappings.some((m) => m.urlPattern === urlPattern && m.ruleId === ruleId);
}

// Get the active default rule ID for a URL (the one that would be used on click)
export async function getActiveDefaultRuleId(url: string): Promise<string | null> {
  const result = await getDefaultRuleForUrl(url);
  return result?.rule.id ?? null;
}

