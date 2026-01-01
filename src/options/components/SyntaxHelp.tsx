import { useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Button } from '@/components';

interface SyntaxHelpProps {
  isOpen: boolean;
  onToggle: () => void;
  canOpen?: boolean; // Whether the sidebar can be opened (e.g., if another sidebar is open)
}

export default function SyntaxHelp({ isOpen, onToggle, canOpen = true }: SyntaxHelpProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+I to toggle help (only if can open)
      if (e.ctrlKey && e.key === 'i' && canOpen) {
        e.preventDefault();
        onToggle();
        return;
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggle, canOpen]);

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && canOpen && (
        <Button
          variant="secondary"
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-40 border-zinc-600 border"
          title="Show Syntax Help (Ctrl+I)"
        >
          <HelpCircle className="w-5 h-5 text-emerald-400" />
          <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-600 rounded text-zinc-400 text-xs">
            CTRL I
          </kbd>
        </Button>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 transition-opacity"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-zinc-900 border-l border-zinc-800 transform transition-transform duration-300 z-40 overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-zinc-200">Syntax Reference</h3>
            <Button variant="ghost" size="icon" onClick={onToggle}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <SyntaxItem
              syntax="{{inc}}"
              description="Auto-increment number"
              example="1, 2, 3..."
              hint="Increases by 1 each time the form is filled"
            />
            <SyntaxItem
              syntax="{{inc:100}}"
              description="Increment from value"
              example="100, 101..."
              hint="Start counting from a specific number"
            />
            <SyntaxItem
              syntax="{{random:5}}"
              description="Random string"
              example="xK9pL"
              hint="Generates random alphanumeric string of given length"
            />
            <SyntaxItem
              syntax="{{pick:a,b,c}}"
              description="Random pick"
              example="b"
              hint="Randomly selects one option from the comma-separated list"
            />
            <SyntaxItem
              syntax="{{date:YYYY-MM-DD}}"
              description="Current date"
              example="2025-12-27"
              hint="Inserts current date/time using format tokens"
            />
            <SyntaxItem
              syntax={'{{regex:[[A-Z]{2}\\d{3}]}}'}
              description="From regex"
              example="AB123"
              hint="Generates text matching the regex pattern inside [ ]"
            />
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-800">
            <p className="text-xs font-medium text-zinc-400 mb-2">Date Tokens</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <code className="px-2 py-1 bg-zinc-800 rounded text-zinc-300">YYYY</code>
              <span className="text-zinc-500">Year (2025)</span>
              <code className="px-2 py-1 bg-zinc-800 rounded text-zinc-300">MM</code>
              <span className="text-zinc-500">Month (01-12)</span>
              <code className="px-2 py-1 bg-zinc-800 rounded text-zinc-300">DD</code>
              <span className="text-zinc-500">Day (01-31)</span>
              <code className="px-2 py-1 bg-zinc-800 rounded text-zinc-300">HH</code>
              <span className="text-zinc-500">Hour (00-23)</span>
              <code className="px-2 py-1 bg-zinc-800 rounded text-zinc-300">mm</code>
              <span className="text-zinc-500">Minute (00-59)</span>
              <code className="px-2 py-1 bg-zinc-800 rounded text-zinc-300">ss</code>
              <span className="text-zinc-500">Second (00-59)</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-800">
            <p className="text-xs font-medium text-zinc-400 mb-3">Hybrid Example</p>
            <code className="block px-3 py-2 bg-zinc-800 rounded text-sm text-emerald-400 break-all">
              {'user_{{inc}}@{{pick:gmail,yahoo}}.com'}
            </code>
            <p className="mt-2 text-xs text-zinc-500">→ user_1@gmail.com</p>
          </div>

          {/* Keyboard shortcuts */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-400 text-xs">Ctrl+I</kbd>
              <span>Toggle help</span>
            </p>
            <p className="text-xs text-zinc-500 flex items-center gap-2 mt-2">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-400 text-xs">Esc</kbd>
              <span>Close</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function SyntaxItem({ syntax, description, example, hint }: { syntax: string; description: string; example: string; hint: string }) {
  return (
    <div className="flex flex-col gap-1.5 pb-3 border-b border-zinc-800/50 last:border-0 last:pb-0">
      <code className="px-2 py-1 bg-zinc-800 rounded text-emerald-400 text-xs font-mono w-fit">{syntax}</code>
      <div className="flex items-center justify-between">
        <p className="text-zinc-300 text-sm">{description}</p>
        <p className="text-zinc-500 text-xs">→ {example}</p>
      </div>
      <p className="text-zinc-500 text-xs italic">{hint}</p>
    </div>
  );
}

