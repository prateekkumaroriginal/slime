import { useEffect, useState } from 'react';
import { Settings, Zap, ChevronDown, Users } from 'lucide-react';
import type { FillRule, FABSettings } from '@/shared/types';
import { getRulesForUrl, getActiveVariant } from '@/storage/rules';
import { Button } from '@/components';

export default function Popup() {
  const [rules, setRules] = useState<FillRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filling, setFilling] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fabEnabled, setFabEnabled] = useState(false);
  const [fabLoading, setFabLoading] = useState(true);
  // Track selected variant per rule (ruleId -> variantId)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  // Track which rule's variant dropdown is expanded
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  useEffect(() => {
    loadRules();
    loadFabSettings();
  }, []);

  async function loadFabSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_FAB_SETTINGS' });
      if (response?.settings) {
        setFabEnabled(response.settings.enabled);
      }
    } catch (error) {
      console.error('Failed to load FAB settings:', error);
    } finally {
      setFabLoading(false);
    }
  }

  async function toggleFab() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_FAB_SETTINGS' });
      const currentSettings: FABSettings = response?.settings ?? { enabled: false, position: { x: 5, y: 10 } };
      const newSettings: FABSettings = { ...currentSettings, enabled: !currentSettings.enabled };
      
      await chrome.runtime.sendMessage({
        type: 'SAVE_FAB_SETTINGS',
        settings: newSettings,
      });
      setFabEnabled(newSettings.enabled);
    } catch (error) {
      console.error('Failed to toggle FAB:', error);
    }
  }

  async function loadRules() {
    try {
      // Get current tab URL
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = tab?.url || '';

      // Get rules matching this URL
      const matchingRules = await getRulesForUrl(url);
      setRules(matchingRules);
      
      // Initialize selected variants from rules' activeVariantId
      const initialVariants: Record<string, string> = {};
      for (const rule of matchingRules) {
        if (rule.variants && rule.variants.length > 0) {
          const activeVariant = getActiveVariant(rule);
          if (activeVariant) {
            initialVariants[rule.id] = activeVariant.id;
          }
        }
      }
      setSelectedVariants(initialVariants);
    } catch (error) {
      console.error('Failed to load rules:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFill(rule: FillRule) {
    setFilling(rule.id);
    setMessage(null);

    try {
      // Get the selected variant ID for this rule (if any)
      const variantId = selectedVariants[rule.id];
      
      const response = await chrome.runtime.sendMessage({
        type: 'FILL_FORM',
        ruleId: rule.id,
        variantId,
      });

      if (response?.success) {
        window.close();
      } else {
        setMessage({
          type: 'error',
          text: response?.error || `Filled ${response?.filledCount || 0} field(s) with errors`,
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fill form' });
      console.error('Fill error:', error);
    } finally {
      setFilling(null);
    }
  }

  function handleVariantChange(ruleId: string, variantId: string) {
    setSelectedVariants((prev) => ({ ...prev, [ruleId]: variantId }));
  }

  function getSelectedVariantName(rule: FillRule): string | null {
    if (!rule.variants || rule.variants.length === 0) return null;
    const selectedId = selectedVariants[rule.id];
    const variant = rule.variants.find((v) => v.id === selectedId);
    return variant?.name ?? rule.variants[0]?.name ?? null;
  }

  function openOptions() {
    chrome.runtime.openOptionsPage();
  }

  return (
    <div className="w-72 bg-zinc-900 text-zinc-100 p-4 font-sans">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold tracking-tight text-emerald-400">Slime</h1>
        <div className="flex items-center gap-1">
          {!fabLoading && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleFab} 
              title={fabEnabled ? 'Disable Action Button' : 'Enable Action Button'}
              className={fabEnabled ? 'text-emerald-400' : 'text-zinc-500'}
            >
              <Zap className="w-5 h-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={openOptions} title="Manage Rules">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-zinc-500 text-sm mb-3">No rules for this page</p>
          <button
            onClick={openOptions}
            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
          >
            + Create a rule
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => {
            const hasVariants = rule.variants && rule.variants.length > 0;
            const selectedVariantName = getSelectedVariantName(rule);
            const isExpanded = expandedRule === rule.id;

            return (
              <div key={rule.id} className="relative">
                <div
                  className={`flex items-stretch bg-zinc-800 rounded-lg border transition-all duration-150 ${
                    filling === rule.id ? 'opacity-50 cursor-wait' : ''
                  } ${isExpanded ? 'border-emerald-500' : 'border-zinc-700 hover:border-zinc-600'}`}
                >
                  {/* Main fill button */}
                  <button
                    onClick={() => handleFill(rule)}
                    disabled={filling === rule.id}
                    className="flex-1 px-4 py-3 text-left font-medium text-sm hover:bg-zinc-700 active:bg-zinc-600 rounded-l-lg transition-colors disabled:cursor-wait"
                  >
                    {filling === rule.id ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        Filling...
                      </span>
                    ) : (
                      <div>
                        <div className="text-zinc-100">{rule.name}</div>
                        {hasVariants && selectedVariantName && (
                          <div className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {selectedVariantName}
                          </div>
                        )}
                      </div>
                    )}
                  </button>

                  {/* Variant dropdown toggle */}
                  {hasVariants && (
                    <button
                      onClick={() => setExpandedRule(isExpanded ? null : rule.id)}
                      disabled={filling === rule.id}
                      className="px-3 border-l border-zinc-700 hover:bg-zinc-700 active:bg-zinc-600 rounded-r-lg transition-colors disabled:cursor-wait"
                      title="Select variant"
                    >
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-400 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Variant dropdown */}
                {hasVariants && isExpanded && (
                  <div className="absolute z-10 left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg overflow-hidden">
                    {rule.variants!.map((variant) => {
                      const isSelected = selectedVariants[rule.id] === variant.id;
                      return (
                        <button
                          key={variant.id}
                          onClick={() => {
                            handleVariantChange(rule.id, variant.id);
                            setExpandedRule(null);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                            isSelected
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          {variant.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {message && (
        <div
          className={`mt-3 px-3 py-2 rounded-md text-sm ${
            message.type === 'success' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-red-900/50 text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
