// ─────────────────────────────────────────────────────────────────────────────
// Application Configuration
// ─────────────────────────────────────────────────────────────────────────────

import type { FABSettings } from './types';

// Chrome storage key for persisting rules
export const STORAGE_KEY = 'slimeData';

// Chrome storage key for FAB settings
export const FAB_SETTINGS_KEY = 'slimeFabSettings';

// Chrome storage key for default rule mappings
export const DEFAULT_RULES_KEY = 'slimeDefaultRules';

// Import/Export versioning
export const CURRENT_VERSION = 1;
export const SUPPORTED_VERSIONS = [1] as const;

// Default FAB settings
export const DEFAULT_FAB_SETTINGS: FABSettings = {
  enabled: false,
  position: { x: 5, y: 10 }, // 5% from right, 10% from bottom
  shortcut: { modifier: 'ctrl', key: 'q' }, // Ctrl+Q default
};

