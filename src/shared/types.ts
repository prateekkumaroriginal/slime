// Match type for field selectors
// - 'id': Match by element ID attribute
// - 'name': Match by element name attribute
// - 'querySelector': Use document.querySelector() directly
// Selectors can use /regex/ syntax for regex matching (id/name only)
export type MatchType = 'id' | 'name' | 'querySelector';

// Value types for dynamic generation
export type ValueType = 'static' | 'template' | 'title' | 'desc';

// Field mapping within a rule
export interface FieldMapping {
  id: string;
  selector: string;
  matchType: MatchType;
  valueType: ValueType;
  value: string; // Raw value or template string with {{placeholders}}
  minLength?: number; // Min characters for title/desc
  maxLength?: number; // Max characters for title/desc
}

// A fill rule configuration
export interface FillRule {
  id: string;
  name: string; // Display name (button label)
  urlPattern: string; // URL pattern to match, e.g., "*://example.com/*"
  fields: FieldMapping[];
  enabled: boolean;
  incrementCounter: number; // Current increment value for {{inc}}
  isArchived?: boolean; // Whether the rule is archived
  createdAt: number;
  updatedAt: number;
}

// Storage structure
export interface StorageData {
  rules: FillRule[];
}

// Message types for communication between popup/background/content
export type MessageType = 'FILL_FORM' | 'GET_RULES' | 'FILL_COMPLETE';

export interface FillFormMessage {
  type: 'FILL_FORM';
  ruleId: string;
}

export interface FillCompleteMessage {
  type: 'FILL_COMPLETE';
  success: boolean;
  filledCount: number;
  errors?: string[];
}

export type ExtensionMessage = FillFormMessage | FillCompleteMessage;

// Template placeholder types
export type PlaceholderType = 'inc' | 'random' | 'pick' | 'date' | 'regex' | 'title' | 'desc';

export interface ParsedPlaceholder {
  type: PlaceholderType;
  raw: string; // Original {{...}} string
  params?: string; // Parameters after the colon
}

// ─────────────────────────────────────────────────────────────────────────────
// Floating Action Button (FAB) Types
// ─────────────────────────────────────────────────────────────────────────────

// FAB position on screen
export interface FABPosition {
  x: number; // Distance from right edge (percentage 0-100)
  y: number; // Distance from bottom edge (percentage 0-100)
}

// Keyboard shortcut configuration
export interface KeyboardShortcut {
  modifier: 'ctrl' | 'shift' | 'alt';
  key: string; // Single letter like 'q', 'z', etc.
}

// FAB settings stored in chrome.storage
export interface FABSettings {
  enabled: boolean;
  position: FABPosition;
  shortcut: KeyboardShortcut;
}

// Default rule mapping - maps URL pattern to rule ID
export interface DefaultRuleMapping {
  urlPattern: string;
  ruleId: string;
}

// Storage structure for default rules
export interface DefaultRulesData {
  mappings: DefaultRuleMapping[];
}

// FAB-related message types
export interface GetFABSettingsMessage {
  type: 'GET_FAB_SETTINGS';
}

export interface SaveFABSettingsMessage {
  type: 'SAVE_FAB_SETTINGS';
  settings: FABSettings;
}

export interface GetDefaultRuleMessage {
  type: 'GET_DEFAULT_RULE';
  url: string;
}

export interface SetDefaultRuleMessage {
  type: 'SET_DEFAULT_RULE';
  urlPattern: string;
  ruleId: string;
}

export interface RemoveDefaultRuleMessage {
  type: 'REMOVE_DEFAULT_RULE';
  urlPattern: string;
}

export interface GetRulesForUrlMessage {
  type: 'GET_RULES_FOR_URL';
  url: string;
}

export interface GetAllDefaultMappingsMessage {
  type: 'GET_ALL_DEFAULT_MAPPINGS';
}

export interface ResetFABPositionMessage {
  type: 'RESET_FAB_POSITION';
}

export type FABMessage =
  | GetFABSettingsMessage
  | SaveFABSettingsMessage
  | GetDefaultRuleMessage
  | SetDefaultRuleMessage
  | RemoveDefaultRuleMessage
  | GetRulesForUrlMessage
  | GetAllDefaultMappingsMessage
  | ResetFABPositionMessage;

