import { Copy, RotateCcw, SquarePen, Trash2 } from 'lucide-react';
import type { FillRule } from '@/shared/types';
import { Button, Switch } from '@/components';

interface RuleListProps {
  rules: FillRule[];
  onEdit: (rule: FillRule) => void;
  onDelete: (id: string) => void;
  onResetIncrement: (id: string) => void;
  onDuplicate: (rule: FillRule) => void;
  onToggle: (id: string) => void;
}

export default function RuleList({ rules, onEdit, onDelete, onResetIncrement, onDuplicate, onToggle }: RuleListProps) {
  return (
    <div className="space-y-3">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className={`relative p-4 pt-7 bg-zinc-900 rounded-xl border transition-colors overflow-hidden ${rule.enabled ? 'border-zinc-800 hover:border-zinc-700' : 'border-zinc-800/50 opacity-60'}`}
        >
          {/* Top-left toggle switch */}
          <Switch
            checked={rule.enabled}
            onChange={() => onToggle(rule.id)}
            label={rule.enabled ? 'Active' : 'Disabled'}
            title={rule.enabled ? 'Disable rule' : 'Enable rule'}
            className={`absolute top-0 left-0 w-[88px] px-2 py-1 rounded-none rounded-tl-md rounded-br-xl transition-colors duration-200 ${rule.enabled ? 'bg-emerald-500/20 hover:bg-emerald-500/20' : 'bg-zinc-700 hover:bg-zinc-700'}`}
          />

          {/* Top-right action buttons */}
          <div className="absolute top-0 right-0 flex items-center p-1">
            <Button variant="ghost" size="icon-sm" onClick={() => onResetIncrement(rule.id)} title="Reset Counter">
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => onDuplicate(rule)} title="Duplicate Rule">
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => onEdit(rule)} title="Edit Rule">
              <SquarePen className="w-3.5 h-3.5" />
            </Button>
            <Button variant="danger" size="icon-sm" onClick={() => onDelete(rule.id)} title="Delete Rule">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-zinc-100 truncate mb-2">{rule.name || 'Unnamed Rule'}</h3>
            <p className="text-sm text-zinc-400 font-mono truncate mb-2">{rule.urlPattern}</p>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span>{rule.fields.length} field(s)</span>
              <span>Counter: {rule.incrementCounter}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
