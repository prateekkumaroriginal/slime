// Match type for field selectors
// - 'id': Match by element ID attribute
// - 'name': Match by element name attribute
// - 'querySelector': Use document.querySelector() directly
// Selectors can use /regex/ syntax for regex matching (id/name only)
export type MatchType = 'id' | 'name' | 'querySelector';

// Value types for dynamic generation
export type ValueType = 'static' | 'template' | 'title' | 'desc' | 'image';

// PostAction types for actions after field/rule completion
export type PostActionType = 'click' | 'focus' | 'pressKey' | 'wait';

// PostAction configuration
export interface PostAction {
  id: string;           // Unique ID for reordering
  type: PostActionType;
  selector?: string;    // For click, focus
  key?: string;         // For pressKey (Enter, Tab, Escape, etc.)
  delay?: number;       // For wait (milliseconds)
}

// Field mapping within a rule
export interface FieldMapping {
  id: string;
  selector: string;
  matchType: MatchType;
  valueType: ValueType;
  value: string; // Raw value or template string with {{placeholders}}
  minLength?: number; // Min characters for title/desc
  maxLength?: number; // Max characters for title/desc
  imageId?: string; // Reference to stored image (when valueType is 'image')
  postActions?: PostAction[]; // Chain of actions to execute after this field fills successfully
}

// ─────────────────────────────────────────────────────────────────────────────
// Repeat Group Types (for filling multiple similar form rows)
// ─────────────────────────────────────────────────────────────────────────────

// Field definition within a repeat group (defines what to target, not the value)
export interface RepeatGroupField {
  id: string;
  label: string;              // Display name: "Name", "Age", "Gender"
  selector: string;           // CSS selector relative to row: "input[name*='name']"
  matchType: MatchType;       // Usually 'querySelector' for repeat groups
}

// A single row of data to fill
export interface RowData {
  id: string;
  values: Record<string, string>;  // fieldId -> value to fill
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant Types (for multiple value sets per rule)
// ─────────────────────────────────────────────────────────────────────────────

// A variant stores alternative values for fields and repeat groups
export interface Variant {
  id: string;
  name: string;  // e.g., "Prateek", "Arpit"
  fieldValues: Record<string, string>;  // fieldId -> value
  repeatGroupData?: Record<string, RowData[]>;  // groupId -> rows
}

// Repeat group for filling multiple similar form rows
export interface RepeatGroup {
  id: string;
  name: string;                    // Display name: "User Entries"
  rowSelector: string;             // CSS selector for row containers: ".user-row"
  fields: RepeatGroupField[];      // Column definitions
  rows: RowData[];                 // Data rows to fill
  postActions?: PostAction[];      // Actions after all rows filled
}

// A fill rule configuration
export interface FillRule {
  id: string;
  name: string; // Display name (button label)
  urlPattern: string; // URL pattern to match, e.g., "*://example.com/*"
  fields: FieldMapping[];
  repeatGroups?: RepeatGroup[]; // Optional repeat groups for filling multiple similar rows
  enabled: boolean;
  incrementCounter: number; // Current increment value for {{inc}}
  isArchived?: boolean; // Whether the rule is archived
  collectionId?: string; // Reference to collection (null/undefined = "Default" collection)
  postActions?: PostAction[]; // Chain of actions to execute after all fields complete successfully
  variants?: Variant[]; // Optional variants for different value sets
  activeVariantId?: string; // Currently selected variant ID
  createdAt: number;
  updatedAt: number;
}

// Storage structure
export interface StorageData {
  rules: FillRule[];
}

// Message types for communication between popup/background/content
export type MessageType = 'FILL_FORM' | 'GET_RULES' | 'FILL_COMPLETE' | 'SET_ACTIVE_VARIANT';

export interface FillFormMessage {
  type: 'FILL_FORM';
  ruleId: string;
  variantId?: string; // Optional variant to use for fill
}

export interface SetActiveVariantMessage {
  type: 'SET_ACTIVE_VARIANT';
  ruleId: string;
  variantId: string;
}

export interface FillCompleteMessage {
  type: 'FILL_COMPLETE';
  success: boolean;
  filledCount: number;
  errors?: string[];
}

export type ExtensionMessage = FillFormMessage | FillCompleteMessage | SetActiveVariantMessage;

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

// ─────────────────────────────────────────────────────────────────────────────
// Image Storage Types
// ─────────────────────────────────────────────────────────────────────────────

// Stored image data
export interface StoredImage {
  id: string;
  name: string;        // Original filename
  mimeType: string;    // e.g., "image/png", "image/jpeg"
  dataUrl: string;     // Base64 data URL
  size: number;        // File size in bytes
  createdAt: number;
}

// Image storage settings (user-configurable)
export interface ImageSettings {
  maxStorageBytes: number;  // User-configurable limit (default: 10MB)
}

// Storage structure for images
export interface ImagesStorageData {
  images: StoredImage[];
}

// Image-related message types
export interface GetImageMessage {
  type: 'GET_IMAGE';
  imageId: string;
}

export interface GetAllImagesMessage {
  type: 'GET_ALL_IMAGES';
}

export interface SaveImageMessage {
  type: 'SAVE_IMAGE';
  image: StoredImage;
}

export interface DeleteImageMessage {
  type: 'DELETE_IMAGE';
  imageId: string;
}

export interface GetImageSettingsMessage {
  type: 'GET_IMAGE_SETTINGS';
}

export interface SaveImageSettingsMessage {
  type: 'SAVE_IMAGE_SETTINGS';
  settings: ImageSettings;
}

export interface GetImageStorageUsageMessage {
  type: 'GET_IMAGE_STORAGE_USAGE';
}

export type ImageMessage =
  | GetImageMessage
  | GetAllImagesMessage
  | SaveImageMessage
  | DeleteImageMessage
  | GetImageSettingsMessage
  | SaveImageSettingsMessage
  | GetImageStorageUsageMessage;

// ─────────────────────────────────────────────────────────────────────────────
// Collections Types
// ─────────────────────────────────────────────────────────────────────────────

// Collection interface
export interface Collection {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

// Storage structure for collections
export interface CollectionsStorageData {
  collections: Collection[];
}

