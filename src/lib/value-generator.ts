import RandExp from 'randexp';
import type { ParsedPlaceholder, PlaceholderType } from '@/shared/types';

// Regex to match placeholders like {{inc}}, {{random:5}}, {{pick:a,b,c}}, etc.
const PLACEHOLDER_REGEX = /\{\{(\w+)(?::([^}]+))?\}\}/g;

// Parse a template string and extract all placeholders
function parsePlaceholders(template: string): ParsedPlaceholder[] {
  const placeholders: ParsedPlaceholder[] = [];
  let match;

  while ((match = PLACEHOLDER_REGEX.exec(template)) !== null) {
    const type = match[1].toLowerCase() as PlaceholderType;
    placeholders.push({
      type,
      raw: match[0],
      params: match[2],
    });
  }
  // Reset regex lastIndex for next use
  PLACEHOLDER_REGEX.lastIndex = 0;

  return placeholders;
}

// Generate a random string of specified length
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Pick a random item from a comma-separated list
function pickRandom(options: string): string {
  const items = options.split(',').map((s) => s.trim());
  return items[Math.floor(Math.random() * items.length)] || '';
}

// Format a date with the given pattern
function formatDate(pattern: string): string {
  const now = new Date();
  
  const tokens: Record<string, string> = {
    'YYYY': now.getFullYear().toString(),
    'YY': now.getFullYear().toString().slice(-2),
    'MM': (now.getMonth() + 1).toString().padStart(2, '0'),
    'M': (now.getMonth() + 1).toString(),
    'DD': now.getDate().toString().padStart(2, '0'),
    'D': now.getDate().toString(),
    'HH': now.getHours().toString().padStart(2, '0'),
    'H': now.getHours().toString(),
    'mm': now.getMinutes().toString().padStart(2, '0'),
    'm': now.getMinutes().toString(),
    'ss': now.getSeconds().toString().padStart(2, '0'),
    's': now.getSeconds().toString(),
  };

  let result = pattern;
  // Sort by length descending to replace longer tokens first
  const sortedTokens = Object.keys(tokens).sort((a, b) => b.length - a.length);
  
  for (const token of sortedTokens) {
    result = result.replace(new RegExp(token, 'g'), tokens[token]);
  }

  return result;
}

// Generate a string from a regex pattern
function generateFromRegex(pattern: string): string {
  try {
    const randexp = new RandExp(pattern);
    randexp.max = 10; // Limit repetition
    return randexp.gen();
  } catch {
    return `[Invalid regex: ${pattern}]`;
  }
}

// Resolve a single placeholder
function resolvePlaceholder(
  placeholder: ParsedPlaceholder,
  incrementValue: number
): { value: string; newIncrement?: number } {
  const { type, params } = placeholder;

  switch (type) {
    case 'inc': {
      const value = params ? parseInt(params, 10) + incrementValue : incrementValue;
      return { value: value.toString(), newIncrement: incrementValue + 1 };
    }

    case 'random': {
      const length = params ? parseInt(params, 10) : 8;
      return { value: generateRandomString(isNaN(length) ? 8 : length) };
    }

    case 'pick': {
      if (!params) return { value: '' };
      return { value: pickRandom(params) };
    }

    case 'date': {
      const format = params || 'YYYY-MM-DD';
      return { value: formatDate(format) };
    }

    case 'regex': {
      if (!params) return { value: '' };
      return { value: generateFromRegex(params) };
    }

    default:
      return { value: placeholder.raw };
  }
}

// Generate a value from a template string
export function generateValue(
  template: string,
  incrementValue: number
): { value: string; newIncrement: number } {
  const placeholders = parsePlaceholders(template);

  if (placeholders.length === 0) {
    // No placeholders, return as-is (static value)
    return { value: template, newIncrement: incrementValue };
  }

  let result = template;
  let currentIncrement = incrementValue;

  for (const placeholder of placeholders) {
    const resolved = resolvePlaceholder(placeholder, currentIncrement);
    result = result.replace(placeholder.raw, resolved.value);
    
    if (resolved.newIncrement !== undefined) {
      currentIncrement = resolved.newIncrement;
    }
  }

  return { value: result, newIncrement: currentIncrement };
}

// Check if a string contains any placeholders
export function hasPlaceholders(value: string): boolean {
  PLACEHOLDER_REGEX.lastIndex = 0;
  return PLACEHOLDER_REGEX.test(value);
}

// Get placeholder type description for UI
export function getPlaceholderHelp(): Array<{ syntax: string; description: string; example: string }> {
  return [
    { syntax: '{{inc}}', description: 'Auto-incrementing number', example: '1, 2, 3...' },
    { syntax: '{{inc:100}}', description: 'Increment starting from value', example: '100, 101, 102...' },
    { syntax: '{{random:5}}', description: 'Random string of length', example: 'xK9pL' },
    { syntax: '{{pick:a,b,c}}', description: 'Random pick from list', example: 'b' },
    { syntax: '{{date:YYYY-MM-DD}}', description: 'Current date/time', example: '2025-12-27' },
    { syntax: '{{regex:[A-Z]{2}\\d{3}}}', description: 'Generate from regex', example: 'AB123' },
  ];
}

