import { useEffect } from 'react';
import { X, RefreshCcw, SquarePen, Trash2, Upload } from 'lucide-react';
import type { FillRule } from '@/shared/types';
import { Button } from '@/components';

interface ArchivedRulesSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  archivedRules: FillRule[];
  onRestore: (id: string) => void;
  onEdit: (rule: FillRule) => void;
  onPermanentDelete: (id: string) => void;
  onExport: (rule: FillRule) => void;
}

export default function ArchivedRulesSidebar({
  isOpen,
  onToggle,
  archivedRules,
  onRestore,
  onEdit,
  onPermanentDelete,
  onExport,
}: ArchivedRulesSidebarProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggle]);

  return (
    <>
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
            <h3 className="text-lg font-semibold text-zinc-200">Archived Rules</h3>
            <Button variant="ghost" size="icon" onClick={onToggle}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {archivedRules.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zinc-500 text-sm">No archived rules</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {archivedRules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex flex-col gap-3 p-4 bg-zinc-800 rounded-lg border border-zinc-700"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200 mb-1 truncate">
                      {rule.name || 'Unnamed Rule'}
                    </h4>
                    <p className="text-xs text-zinc-400 font-mono truncate">
                      {rule.urlPattern}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onRestore(rule.id)}
                      title="Restore Rule"
                      className="hover:text-green-400 hover:bg-green-500/20"
                    >
                      <RefreshCcw className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onExport(rule)}
                      title="Export Rule"
                      className="hover:text-violet-400 hover:bg-violet-500/20"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(rule)}
                      title="Edit Rule"
                      className="hover:text-cyan-400 hover:bg-cyan-500/20"
                    >
                      <SquarePen className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onPermanentDelete(rule.id)}
                      title="Delete Permanently"
                      className="hover:text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Keyboard shortcuts */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-400 text-xs">Esc</kbd>
              <span>Close</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

