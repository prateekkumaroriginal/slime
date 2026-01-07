import { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';
import type { FABSettings, DefaultRuleMapping, KeyboardShortcut } from '@/shared/types';
import { Button, Card, Switch, Select } from '@/components';

interface EnrichedMapping extends DefaultRuleMapping {
  ruleName: string;
}

interface FabConfigProps {
  onBack: () => void;
}

export default function FabConfig({ onBack }: FabConfigProps) {
  const [settings, setSettings] = useState<FABSettings | null>(null);
  const [mappings, setMappings] = useState<EnrichedMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Load FAB settings
      const settingsResponse = await chrome.runtime.sendMessage({ type: 'GET_FAB_SETTINGS' });
      if (settingsResponse?.settings) {
        setSettings(settingsResponse.settings);
      }

      // Load default rule mappings
      const mappingsResponse = await chrome.runtime.sendMessage({ type: 'GET_ALL_DEFAULT_MAPPINGS' });
      if (mappingsResponse?.mappings) {
        setMappings(mappingsResponse.mappings);
      }
    } catch (error) {
      console.error('Failed to load FAB config:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleEnabled(enabled: boolean) {
    if (!settings) return;

    const newSettings: FABSettings = {
      ...settings,
      enabled,
    };

    setSaving(true);
    try {
      await chrome.runtime.sendMessage({
        type: 'SAVE_FAB_SETTINGS',
        settings: newSettings,
      });
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save FAB settings:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPosition() {
    setSaving(true);
    try {
      const response = await chrome.runtime.sendMessage({ type: 'RESET_FAB_POSITION' });
      if (response?.settings) {
        setSettings(response.settings);
      }
    } catch (error) {
      console.error('Failed to reset position:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleShortcutChange(modifier: KeyboardShortcut['modifier'], key: string) {
    if (!settings) return;

    const newSettings: FABSettings = {
      ...settings,
      shortcut: { modifier, key },
    };

    setSaving(true);
    try {
      await chrome.runtime.sendMessage({
        type: 'SAVE_FAB_SETTINGS',
        settings: newSettings,
      });
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save shortcut:', error);
    } finally {
      setSaving(false);
    }
  }

  function formatShortcut(shortcut?: KeyboardShortcut): string {
    if (!shortcut) return 'Ctrl+Q';
    const mod = shortcut.modifier.charAt(0).toUpperCase() + shortcut.modifier.slice(1);
    return `${mod}+${shortcut.key.toUpperCase()}`;
  }

  async function handleRemoveDefaultRule(urlPattern: string) {
    if (!confirm(`Remove default rule for pattern "${urlPattern}"?`)) {
      return;
    }

    try {
      await chrome.runtime.sendMessage({
        type: 'REMOVE_DEFAULT_RULE',
        urlPattern,
      });
      // Refresh mappings
      const mappingsResponse = await chrome.runtime.sendMessage({ type: 'GET_ALL_DEFAULT_MAPPINGS' });
      if (mappingsResponse?.mappings) {
        setMappings(mappingsResponse.mappings);
      }
    } catch (error) {
      console.error('Failed to remove default rule:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} title="Back to Rules">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-semibold text-zinc-200">Action Button</h2>
        </div>
      </div>

      {/* FAB Settings */}
      <Card>
        <h3 className="text-lg font-medium text-zinc-200 mb-4">Settings</h3>
        
        <div className="space-y-4">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-zinc-200">Show Action Button</p>
              <p className="text-xs text-zinc-500">Display floating button on all pages</p>
            </div>
            <Switch
              checked={settings?.enabled ?? false}
              onChange={() => handleToggleEnabled(!(settings?.enabled ?? false))}
            />
          </div>

          {/* Position Info & Reset */}
          <div className="flex items-center justify-between py-2 border-t border-zinc-700">
            <div>
              <p className="text-sm font-medium text-zinc-200">Button Position</p>
              <p className="text-xs text-zinc-500">
                {settings 
                  ? `${settings.position.x.toFixed(1)}% from right, ${settings.position.y.toFixed(1)}% from bottom`
                  : 'Default position'
                }
              </p>
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleResetPosition}
              disabled={saving}
            >
              <RotateCcw className="w-4 h-4" />
              Reset Position
            </Button>
          </div>

          {/* Keyboard Shortcut */}
          <div className="flex items-center justify-between py-2 border-t border-zinc-700">
            <div>
              <p className="text-sm font-medium text-zinc-200">Keyboard Shortcut</p>
              <p className="text-xs text-zinc-500">Quick fill with default rule</p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={settings?.shortcut?.modifier ?? 'ctrl'}
                onChange={(value) => handleShortcutChange(value as KeyboardShortcut['modifier'], settings?.shortcut?.key ?? 'q')}
                options={[
                  { value: 'ctrl', label: 'Ctrl' },
                  { value: 'shift', label: 'Shift' },
                  { value: 'alt', label: 'Alt' },
                ]}
              />
              <span className="text-zinc-500">+</span>
              <Select
                value={settings?.shortcut?.key ?? 'q'}
                onChange={(value) => handleShortcutChange(settings?.shortcut?.modifier ?? 'ctrl', value)}
                options={[
                  { value: 'q', label: 'Q' },
                  { value: 'j', label: 'J' },
                  { value: 'k', label: 'K' },
                  { value: 'l', label: 'L' },
                  { value: 'z', label: 'Z' },
                  { value: 'x', label: 'X' },
                  { value: 'f', label: 'F' },
                  { value: 'g', label: 'G' },
                  { value: 'm', label: 'M' },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Default Rules */}
      <Card>
        <h3 className="text-lg font-medium text-zinc-200 mb-4">Default Rules</h3>
        <p className="text-sm text-zinc-500 mb-4">
          Default rules are automatically applied when you click the action button. 
          More specific URL patterns take priority.
        </p>

        {mappings.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <p className="text-sm">No default rules set yet.</p>
            <p className="text-xs mt-1">Click the star icon in the action button popup to set a default rule.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {mappings.map((mapping) => (
              <div
                key={mapping.urlPattern}
                className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-medium text-zinc-200 truncate">
                    {mapping.ruleName}
                  </p>
                  <p className="text-xs text-zinc-500 font-mono truncate" title={mapping.urlPattern}>
                    {mapping.urlPattern}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveDefaultRule(mapping.urlPattern)}
                  title="Remove default"
                  className="flex-shrink-0 hover:text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Instructions */}
      <Card className="bg-zinc-800/50">
        <h3 className="text-lg font-medium text-zinc-200 mb-3">How to use</h3>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span><strong className="text-zinc-300">{formatShortcut(settings?.shortcut)}</strong> keyboard shortcut to instantly fill with the default rule</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span><strong className="text-zinc-300">Left-click</strong> the button to auto-fill with the default rule, or open the menu if no default is set</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span><strong className="text-zinc-300">Right-click</strong> to always open the menu</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span><strong className="text-zinc-300">Drag</strong> to move the button to any corner</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span>Right-click a rule and click <strong className="text-zinc-300">Set as default</strong> to make it the default for its URL pattern</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}

