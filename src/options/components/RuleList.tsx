import { RotateCcw, SquarePen, Trash2 } from 'lucide-react';
import type { FillRule } from '@/shared/types';
import { Button } from '@/components';

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

            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" onClick={() => onResetIncrement(rule.id)} title="Reset Counter">
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onEdit(rule)} title="Edit Rule">
                <SquarePen className="w-4 h-4" />
              </Button>
              <Button variant="danger" size="icon" onClick={() => onDelete(rule.id)} title="Delete Rule">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
