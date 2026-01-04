import { useState, useEffect, useRef, useEffectEvent } from 'react';
import { Plus, Trash2, Archive, RotateCcw } from 'lucide-react';
import type { FillRule, FieldMapping, MatchType } from '@/shared/types';
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
            <Button type="button" variant="ghost" onClick={handleRestore}>
              <RotateCcw className="w-4 h-4" />
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
            <Button type="button" variant="ghost" onClick={handleArchive}>
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

function FieldMappingRow({ field, index, onUpdate, onRemove }: FieldMappingRowProps) {
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-zinc-400 mb-1">Value (static or template)</label>
          <input
            type="text"
            value={field.value}
            onChange={(e) => onUpdate({ value: e.target.value })}
            placeholder="john@example.com or user_{{inc}}@test.com"
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}
