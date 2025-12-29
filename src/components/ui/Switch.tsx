import { cn } from '@/lib/cn';
import Button from './Button';

interface SwitchProps {
  checked: boolean;
  onChange?: () => void;
  label?: string;
  title?: string;
  className?: string;
}

export default function Switch({ checked, onChange, label, title, className }: SwitchProps) {
  const content = (
    <>
      {/* Track */}
      <span
        className={cn(
          'relative w-5 h-3 rounded-full transition-colors duration-200 shrink-0',
          checked ? 'bg-emerald-500' : 'bg-zinc-500'
        )}
      >
        {/* Thumb */}
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-2 h-2 bg-white rounded-full shadow-sm transition-transform duration-200',
            checked ? 'translate-x-2' : 'translate-x-0'
          )}
        />
      </span>
      {label && (
        <span
          className={cn(
            'text-[9px] font-semibold uppercase tracking-wide flex-1 transition-colors duration-200',
            checked ? 'text-emerald-400' : 'text-zinc-400'
          )}
        >
          {label}
        </span>
      )}
    </>
  );

  if (onChange) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onChange}
        title={title}
        className={cn('gap-1.5 p-0 hover:bg-transparent', className)}
      >
        {content}
      </Button>
    );
  }

  return (
    <span className={cn('flex items-center gap-1.5', className)}>
      {content}
    </span>
  );
}

