import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
  className?: string;
}

export default function Select({ label, value, options, onChange, className = '' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleToggle() {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = options.length * 36 + 2; // ~36px per option + border
      setOpenUpward(spaceBelow < dropdownHeight && rect.top > dropdownHeight);
    }
    setIsOpen(!isOpen);
  }

  function handleSelect(optionValue: string) {
    onChange?.(optionValue);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-zinc-400 mb-1">{label}</label>
      )}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={`w-full px-3 py-2 bg-zinc-900 border rounded-lg text-zinc-100 text-sm text-left flex items-center justify-between gap-2 transition-colors ${
          isOpen ? 'border-emerald-500 ring-2 ring-emerald-500' : 'border-zinc-600 hover:border-zinc-500'
        }`}
      >
        <span>{selectedOption?.label || 'Select...'}</span>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 w-full rounded-lg shadow-xl overflow-hidden border border-zinc-600 bg-zinc-800 ${
            openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full px-3 py-2 text-sm text-left flex items-center justify-between transition-colors ${
                option.value === value
                  ? 'bg-emerald-600 text-white'
                  : 'text-zinc-100 hover:bg-zinc-700'
              }`}
            >
              <span>{option.label}</span>
              {option.value === value && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
