// Match type for field selectors
export type MatchType = 'name' | 'id';

// Value types for dynamic generation
export type ValueType = 'static' | 'template';

// Field mapping within a rule
export interface FieldMapping {
  id: string;
  selector: string;
  matchType: MatchType;
  valueType: ValueType;
  value: string; // Raw value or template string with {{placeholders}}
}

// A fill rule configuration
export interface FillRule {
  id: string;
  name: string; // Display name (button label)
  urlPattern: string; // URL pattern to match, e.g., "*://example.com/*"
  fields: FieldMapping[];
  enabled: boolean;
  incrementCounter: number; // Current increment value for {{inc}}
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
export type PlaceholderType = 'inc' | 'random' | 'pick' | 'date' | 'regex';

export interface ParsedPlaceholder {
  type: PlaceholderType;
  raw: string; // Original {{...}} string
  params?: string; // Parameters after the colon
}

