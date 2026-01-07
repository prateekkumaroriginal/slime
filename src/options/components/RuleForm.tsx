import { useState, useEffect, useRef, useEffectEvent } from 'react';
import { Plus, Trash2, Archive, RefreshCcw } from 'lucide-react';
import type { FillRule, FieldMapping, MatchType, ValueType } from '@/shared/types';
import { generateId } from '@/storage/rules';
import { Button, Input, Select, Checkbox, Card } from '@/components';

interface RuleFormProps {
  rule: FillRule;
  onSave: (rule: FillRule) => void;
  onCancel: () => void;
  isNew: boolean;
  isHelpOpen?: boolean;
  isArchivedSidebarOpen?: boolean;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

export default function RuleForm({ rule, onSave, onCancel, isNew, isHelpOpen, isArchivedSidebarOpen, onArchive, onRestore, onPermanentDelete }: RuleFormProps) {
  const [formData, setFormData] = useState<FillRule>(rule);
  const formRef = useRef<HTMLFormElement>(null);

  // Ctrl+Enter to submit, Escape to cancel
  // Skip Escape handling if any sidebar is open (sidebars have priority)
  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      formRef.current?.requestSubmit();
    } else if (e.key === 'Escape' && !isArchivedSidebarOpen && !isHelpOpen) {
      e.preventDefault();
      onCancel();
    }
  });

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  function updateField(key: keyof FillRule, value: unknown) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function addFieldMapping() {
    const newMapping: FieldMapping = {
      id: generateId(),
      selector: '',
      matchType: 'id',
      valueType: 'static',
      value: '',
    };
    setFormData((prev) => ({ ...prev, fields: [...prev.fields, newMapping] }));
  }

  function updateFieldMapping(id: string, updates: Partial<FieldMapping>) {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  }

  function removeFieldMapping(id: string) {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== id),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(formData);
  }

  function handleArchive() {
    if (formData.id) {
      setFormData((prev) => ({ ...prev, isArchived: true }));
      onArchive(formData.id);
    }
  }

  function handleRestore() {
    if (formData.id) {
      setFormData((prev) => ({ ...prev, isArchived: false }));
      onRestore(formData.id);
    }
  }

  function handlePermanentDelete() {
    if (formData.id) {
      onPermanentDelete(formData.id);
      onCancel();
    }
  }

  // Prevent Enter from submitting (only Ctrl+Enter should submit)
  function handleFormKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.ctrlKey) {
      e.preventDefault();
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-200">{isNew ? 'Create New Rule' : 'Edit Rule'}</h2>
        <div className="flex items-center gap-2">
          {!isNew && formData.isArchived && (
            <Button type="button" variant="ghost" onClick={handleRestore} className="hover:text-green-400 hover:bg-green-500/20">
              <RefreshCcw className="w-4 h-4" />
              Restore
            </Button>
          )}
          {!isNew && formData.isArchived && (
            <Button type="button" variant="danger" onClick={handlePermanentDelete}>
              <Trash2 className="w-4 h-4" />
              Delete Permanently
            </Button>
          )}
          {!isNew && !formData.isArchived && (
            <Button type="button" variant="ghost" onClick={handleArchive} className="hover:text-orange-400 hover:bg-orange-500/20">
              <Archive className="w-4 h-4" />
              Archive
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Rule</Button>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Rule Name"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="e.g., User, Admin, Creator"
            required
          />
          <Input
            label="URL Pattern"
            value={formData.urlPattern}
            onChange={(e) => updateField('urlPattern', e.target.value)}
            placeholder="*://example.com/* or /regex/"
            hint="Use * for all sites, /regex/ for regex"
            mono
          />
        </div>

        <Checkbox
          label="Enable this rule"
          checked={formData.enabled}
          onChange={(e) => updateField('enabled', e.target.checked)}
        />
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-zinc-200">Field Mappings</h3>
          <Button type="button" variant="secondary" size="sm" onClick={addFieldMapping}>
            <Plus className="w-4 h-4" />
            Add Field
          </Button>
        </div>

        {formData.fields.length === 0 ? (
          <p className="text-center py-8 text-zinc-500">No fields yet. Click "Add Field" to create one.</p>
        ) : (
          <div className="space-y-4">
            {formData.fields.map((field, index) => (
              <FieldMappingRow
                key={field.id}
                field={field}
                index={index}
                onUpdate={(updates) => updateFieldMapping(field.id, updates)}
                onRemove={() => removeFieldMapping(field.id)}
              />
            ))}
          </div>
        )}
      </Card>
    </form>
  );
}

interface FieldMappingRowProps {
  field: FieldMapping;
  index: number;
  onUpdate: (updates: Partial<FieldMapping>) => void;
  onRemove: () => void;
}

const matchTypeOptions = [
  { value: 'id', label: 'ID' },
  { value: 'name', label: 'Name' },
  { value: 'querySelector', label: 'Query Selector' },
];

const valueTypeOptions = [
  { value: 'static', label: 'Static' },
  { value: 'template', label: 'Template' },
  { value: 'title', label: 'Title' },
  { value: 'desc', label: 'Description' },
];

// Get placeholder text based on matchType
function getSelectorPlaceholder(matchType: MatchType): string {
  switch (matchType) {
    case 'id':
      return 'user-email or /^input-\\d+$/';
    case 'name':
      return 'email or /^user_.+$/';
    case 'querySelector':
      return '#form input[type="email"]';
  }
}

// Generate the internal placeholder syntax for title/desc
function generatePlaceholderValue(valueType: ValueType, minLength?: number, maxLength?: number): string {
  if (valueType !== 'title' && valueType !== 'desc') return '';
  
  const type = valueType;
  if (minLength || maxLength) {
    const min = minLength ?? '';
    const max = maxLength ?? '';
    return `{{${type}:${min},${max}}}`;
  }
  return `{{${type}}}`;
}

function FieldMappingRow({ field, index, onUpdate, onRemove }: FieldMappingRowProps) {
  // Handle value type change
  function handleValueTypeChange(newType: ValueType) {
    if (newType === 'title' || newType === 'desc') {
      // Auto-generate placeholder syntax
      const value = generatePlaceholderValue(newType, field.minLength, field.maxLength);
      onUpdate({ valueType: newType, value });
    } else {
      // Clear min/max when switching to static/template
      onUpdate({ valueType: newType, value: '', minLength: undefined, maxLength: undefined });
    }
  }

  // Handle min/max changes for title/desc
  function handleMinMaxChange(minLength?: number, maxLength?: number) {
    const value = generatePlaceholderValue(field.valueType, minLength, maxLength);
    onUpdate({ minLength, maxLength, value });
  }

  const isContentType = field.valueType === 'title' || field.valueType === 'desc';

  return (
    <div className="relative p-4 pt-10 bg-zinc-800 rounded-lg border border-zinc-700">
      {/* Top bar with number and delete */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between">
        <span className="px-3 py-1 bg-zinc-700 text-zinc-400 text-xs font-medium rounded-tl-md rounded-br-md">
          {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="px-3 py-1 bg-zinc-700 text-zinc-400 hover:text-red-400 hover:bg-red-500/20 rounded-tr-md rounded-bl-md transition-colors"
          title="Delete Field"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-4">
        {/* Row 1: Match By, Selector, Value Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Match By"
            value={field.matchType}
            onChange={(value) => onUpdate({ matchType: value as MatchType })}
            options={matchTypeOptions}
          />

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Selector</label>
            <input
              type="text"
              value={field.selector}
              onChange={(e) => onUpdate({ selector: e.target.value })}
              placeholder={getSelectorPlaceholder(field.matchType)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <Select
            label="Value Type"
            value={field.valueType}
            onChange={(value) => handleValueTypeChange(value as ValueType)}
            options={valueTypeOptions}
          />
        </div>

        {/* Row 2: Value input or Min/Max inputs */}
        {isContentType ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Min Chars</label>
              <input
                type="number"
                value={field.minLength ?? ''}
                onChange={(e) => handleMinMaxChange(
                  e.target.value ? parseInt(e.target.value, 10) : undefined,
                  field.maxLength
                )}
                placeholder="No minimum"
                min={0}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Max Chars</label>
              <input
                type="number"
                value={field.maxLength ?? ''}
                onChange={(e) => handleMinMaxChange(
                  field.minLength,
                  e.target.value ? parseInt(e.target.value, 10) : undefined
                )}
                placeholder="No maximum"
                min={0}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              {field.valueType === 'template' ? 'Value (use {{placeholders}})' : 'Value'}
            </label>
            <input
              type="text"
              value={field.value}
              onChange={(e) => onUpdate({ value: e.target.value })}
              placeholder={field.valueType === 'template' ? 'user_{{inc}}@test.com' : 'john@example.com'}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}
