// ─────────────────────────────────────────────────────────────────────────────
// Application Configuration
// ─────────────────────────────────────────────────────────────────────────────

import type { FABSettings, ImageSettings } from './types';

// Chrome storage key for persisting rules
export const STORAGE_KEY = 'slimeData';

// Chrome storage key for FAB settings
export const FAB_SETTINGS_KEY = 'slimeFabSettings';

// Chrome storage key for default rule mappings
export const DEFAULT_RULES_KEY = 'slimeDefaultRules';

// Chrome storage key for images
export const IMAGES_STORAGE_KEY = 'slimeImages';

// Chrome storage key for image settings
export const IMAGE_SETTINGS_KEY = 'slimeImageSettings';

// Import/Export versioning
export const CURRENT_VERSION = 1;
export const SUPPORTED_VERSIONS = [1] as const;

// Default FAB settings
export const DEFAULT_FAB_SETTINGS: FABSettings = {
  enabled: false,
  position: { x: 5, y: 10 }, // 5% from right, 10% from bottom
  shortcut: { modifier: 'ctrl', key: 'q' }, // Ctrl+Q default
};

// Default image settings
export const DEFAULT_IMAGE_SETTINGS: ImageSettings = {
  maxStorageBytes: 10 * 1024 * 1024, // 10 MB default
};

// Image storage limits
export const MIN_IMAGE_STORAGE_MB = 1;   // 1 MB minimum
export const MAX_IMAGE_STORAGE_MB = 100; // 100 MB maximum

