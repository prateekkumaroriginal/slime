import { useState } from 'react';
import type { FillRule, FieldMapping, MatchType } from '@/shared/types';
import { generateId } from '@/storage/rules';

interface RuleFormProps {
  rule: FillRule;
  onSave: (rule: FillRule) => void;
  onCancel: () => void;
  isNew: boolean;
}

export default function RuleForm({ rule, onSave, onCancel, isNew }: RuleFormProps) {
  const [formData, setFormData] = useState<FillRule>(rule);

  function updateField(key: keyof FillRule, value: unknown) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function addFieldMapping() {
    const newMapping: FieldMapping = {
      id: generateId(),
      selector: '',
      matchType: 'name',
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-200">{isNew ? 'Create New Rule' : 'Edit Rule'}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
          >
            Save Rule
          </button>
        </div>
      </div>

      <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Rule Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g., User, Admin, Creator"
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">URL Pattern</label>
            <input
              type="text"
              value={formData.urlPattern}
              onChange={(e) => updateField('urlPattern', e.target.value)}
              placeholder="*://example.com/* or *"
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm"
            />
            <p className="mt-1 text-xs text-zinc-500">Use * for all sites</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="enabled"
            checked={formData.enabled}
            onChange={(e) => updateField('enabled', e.target.checked)}
            className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900"
          />
          <label htmlFor="enabled" className="text-sm text-zinc-300">
            Enable this rule
          </label>
        </div>
      </div>

      <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-zinc-200">Field Mappings</h3>
          <button
            type="button"
            onClick={addFieldMapping}
            className="px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Field
          </button>
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
      </div>
    </form>
  );
}

interface FieldMappingRowProps {
  field: FieldMapping;
  index: number;
  onUpdate: (updates: Partial<FieldMapping>) => void;
  onRemove: () => void;
}

function FieldMappingRow({ field, index, onUpdate, onRemove }: FieldMappingRowProps) {
  return (
    <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
      <div className="flex items-start gap-4">
        <span className="w-6 h-6 flex items-center justify-center bg-zinc-700 text-zinc-400 text-xs font-medium rounded-full shrink-0">
          {index + 1}
        </span>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Match By</label>
            <select
              value={field.matchType}
              onChange={(e) => onUpdate({ matchType: e.target.value as MatchType })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="name">Name</option>
              <option value="id">ID</option>
              <option value="css">CSS Selector</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Selector</label>
            <input
              type="text"
              value={field.selector}
              onChange={(e) => onUpdate({ selector: e.target.value })}
              placeholder={field.matchType === 'css' ? 'input.email' : 'email'}
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

        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
          title="Remove Field"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

