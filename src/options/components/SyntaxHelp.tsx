import { useEffect } from 'react';
import { HelpCircle, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components';

interface SyntaxHelpProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function SyntaxHelp({ isOpen, onToggle }: SyntaxHelpProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggle]);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed top-1/2 right-0 -translate-y-1/2 z-40 p-2 bg-zinc-800 border border-zinc-700 border-r-0 rounded-l-lg transition-colors hover:bg-zinc-700"
        title={isOpen ? 'Hide Syntax Help' : 'Show Syntax Help'}
      >
        {isOpen ? (
          <ChevronRight className="w-5 h-5 text-zinc-400" />
        ) : (
          <HelpCircle className="w-5 h-5 text-emerald-400" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 transition-opacity"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-zinc-900 border-l border-zinc-800 transform transition-transform duration-300 z-40 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-zinc-200">Syntax Reference</h3>
            <Button variant="ghost" size="icon" onClick={onToggle}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <SyntaxItem syntax="{{inc}}" description="Auto-increment number" example="1, 2, 3..." />
            <SyntaxItem syntax="{{inc:100}}" description="Increment from value" example="100, 101..." />
            <SyntaxItem syntax="{{random:5}}" description="Random string" example="xK9pL" />
            <SyntaxItem syntax="{{pick:a,b,c}}" description="Random pick" example="b" />
            <SyntaxItem syntax="{{date:YYYY-MM-DD}}" description="Current date" example="2025-12-27" />
            <SyntaxItem syntax={'{{regex:[A-Z]{2}\\d{3}}}'} description="From regex" example="AB123" />
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
        </div>
      </div>
    </>
  );
}

function SyntaxItem({ syntax, description, example }: { syntax: string; description: string; example: string }) {
  return (
    <div className="flex flex-col gap-1">
      <code className="px-2 py-1 bg-zinc-800 rounded text-emerald-400 text-xs font-mono w-fit">{syntax}</code>
      <div className="flex items-center justify-between">
        <p className="text-zinc-300 text-sm">{description}</p>
        <p className="text-zinc-500 text-xs">→ {example}</p>
      </div>
    </div>
  );
}

