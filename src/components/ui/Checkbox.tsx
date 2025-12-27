import type { InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export default function Checkbox({ label, className = '', id, checked, ...props }: CheckboxProps) {
  const checkboxId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label htmlFor={checkboxId} className={`flex items-center gap-3 cursor-pointer group w-fit ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          className="sr-only peer"
          {...props}
        />
        <div className="w-5 h-5 rounded border-2 border-zinc-600 bg-zinc-800 transition-colors peer-checked:bg-emerald-500 peer-checked:border-emerald-500 peer-focus:ring-2 peer-focus:ring-emerald-500 peer-focus:ring-offset-2 peer-focus:ring-offset-zinc-900 group-hover:border-zinc-500" />
        <Check
          className={`absolute top-0.5 left-0.5 w-4 h-4 text-white transition-opacity ${checked ? 'opacity-100' : 'opacity-0'}`}
          strokeWidth={3}
        />
      </div>
      <span className="text-sm text-zinc-300 select-none">{label}</span>
    </label>
  );
}
