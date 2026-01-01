import { z } from 'zod';
import type { FillRule, StorageData } from '@/shared/types';
import { STORAGE_KEY, CURRENT_VERSION, SUPPORTED_VERSIONS } from '@/shared/config';

// ─────────────────────────────────────────────────────────────────────────────
// Zod Schema for Import Validation (with custom error messages)
// ─────────────────────────────────────────────────────────────────────────────

const FieldMappingSchema = z.object({
  id: z.string({ message: 'Field id must be a string' }),
  selector: z.string({ message: 'Field selector must be a string' }),
  matchType: z.enum(['name', 'id'], { message: 'matchType must be "name" or "id"' }),
  valueType: z.enum(['static', 'template'], { message: 'valueType must be "static" or "template"' }),
  value: z.string({ message: 'Field value must be a string' }),
});

const FillRuleSchema = z.object({
  name: z.string({ message: 'Rule name must be a string' }),
  urlPattern: z.string({ message: 'urlPattern must be a string' }),
  fields: z.array(FieldMappingSchema, { message: 'fields must be an array' }),
  enabled: z.boolean({ message: 'enabled must be a boolean' }),
  incrementCounter: z.number({ message: 'incrementCounter must be a number' }).optional(),
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

