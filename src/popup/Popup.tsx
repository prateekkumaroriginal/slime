import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import type { FillRule } from '@/shared/types';
import { getRulesForUrl } from '@/storage/rules';

export default function Popup() {
  const [rules, setRules] = useState<FillRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filling, setFilling] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    try {
      // Get current tab URL
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = tab?.url || '';

      // Get rules matching this URL
      const matchingRules = await getRulesForUrl(url);
      setRules(matchingRules);
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
      const response = await chrome.runtime.sendMessage({
        type: 'FILL_FORM',
        ruleId: rule.id,
      });

      if (response?.success) {
        setMessage({ type: 'success', text: `Filled ${response.filledCount} field(s)` });
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

  function openOptions() {
    chrome.runtime.openOptionsPage();
  }

  return (
    <div className="w-72 bg-zinc-900 text-zinc-100 p-4 font-sans">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold tracking-tight text-emerald-400">Form Filler</h1>
        <button
          onClick={openOptions}
          className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors"
          title="Manage Rules"
        >
          <Settings className="w-5 h-5" />
        </button>
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
        <div className="grid grid-cols-2 gap-2">
          {rules.map((rule) => (
            <button
              key={rule.id}
              onClick={() => handleFill(rule)}
              disabled={filling === rule.id}
              className="relative px-4 py-3 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-lg font-medium text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-wait border border-zinc-700 hover:border-zinc-600"
            >
              {filling === rule.id ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                </span>
              ) : (
                rule.name
              )}
            </button>
          ))}
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
