import { RotateCcw, SquarePen, Trash2 } from 'lucide-react';
import type { FillRule } from '@/shared/types';

interface RuleListProps {
  rules: FillRule[];
  onEdit: (rule: FillRule) => void;
  onDelete: (id: string) => void;
  onResetIncrement: (id: string) => void;
}

export default function RuleList({ rules, onEdit, onDelete, onResetIncrement }: RuleListProps) {
  return (
    <div className="space-y-3">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-zinc-100 truncate">{rule.name || 'Unnamed Rule'}</h3>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    rule.enabled ? 'bg-emerald-900/50 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {rule.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-sm text-zinc-400 font-mono truncate mb-2">{rule.urlPattern}</p>
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span>{rule.fields.length} field(s)</span>
                <span>Counter: {rule.incrementCounter}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onResetIncrement(rule.id)}
                className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Reset Counter"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(rule)}
                className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Edit Rule"
              >
                <SquarePen className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(rule.id)}
                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete Rule"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
