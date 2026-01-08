import { useState, useEffect, useRef, useEffectEvent } from 'react';
import { Plus, Trash2, Archive, RefreshCcw, ChevronDown, ChevronRight, Grip } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { FillRule, FieldMapping, MatchType, ValueType, PostAction, PostActionType } from '@/shared/types';
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

  // Rule-level PostActions management
  function addPostAction() {
    const newAction: PostAction = {
      id: generateId(),
      type: 'wait',
      delay: 500,
    };
    setFormData((prev) => ({
      ...prev,
      postActions: [...(prev.postActions ?? []), newAction],
    }));
  }

  function updatePostAction(id: string, updates: Partial<PostAction>) {
    setFormData((prev) => ({
      ...prev,
      postActions: prev.postActions?.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
  }

  function removePostAction(id: string) {
    setFormData((prev) => ({
      ...prev,
      postActions: prev.postActions?.filter((a) => a.id !== id),
    }));
  }

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id && formData.postActions) {
      const oldIndex = formData.postActions.findIndex((a) => a.id === active.id);
      const newIndex = formData.postActions.findIndex((a) => a.id === over.id);
      setFormData((prev) => ({
        ...prev,
        postActions: arrayMove(prev.postActions!, oldIndex, newIndex),
      }));
    }
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

      {/* Rule-level PostActions */}
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-zinc-200">PostActions (on complete)</h3>
          <Button type="button" variant="secondary" size="sm" onClick={addPostAction}>
            <Plus className="w-4 h-4" />
            Add Action
          </Button>
        </div>

        {(!formData.postActions || formData.postActions.length === 0) ? (
          <p className="text-center py-8 text-zinc-500">No post-actions yet. These run after all fields fill successfully.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={formData.postActions.map((a) => a.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {formData.postActions.map((action) => (
                  <PostActionRow
                    key={action.id}
                    action={action}
                    onUpdate={(updates) => updatePostAction(action.id, updates)}
                    onRemove={() => removePostAction(action.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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

const postActionTypeOptions = [
  { value: 'none', label: 'None' },
  { value: 'click', label: 'Click' },
  { value: 'focus', label: 'Focus' },
  { value: 'pressKey', label: 'Press Key' },
  { value: 'wait', label: 'Wait' },
];

const keyOptions = [
  { value: 'Enter', label: 'Enter' },
  { value: 'Tab', label: 'Tab' },
  { value: 'Escape', label: 'Escape' },
  { value: 'Space', label: 'Space' },
  { value: 'ArrowDown', label: 'Arrow Down' },
  { value: 'ArrowUp', label: 'Arrow Up' },
  { value: 'ArrowLeft', label: 'Arrow Left' },
  { value: 'ArrowRight', label: 'Arrow Right' },
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
  const [postActionExpanded, setPostActionExpanded] = useState(!!field.postAction);

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

  // Handle PostAction type change
  function handlePostActionTypeChange(type: string) {
    if (type === 'none') {
      onUpdate({ postAction: undefined });
    } else {
      const newAction: PostAction = {
        id: field.postAction?.id || generateId(),
        type: type as PostActionType,
        selector: type === 'click' || type === 'focus' ? '' : undefined,
        key: type === 'pressKey' ? 'Enter' : undefined,
        delay: type === 'wait' ? 500 : undefined,
      };
      onUpdate({ postAction: newAction });
    }
  }

  // Update PostAction properties
  function updatePostAction(updates: Partial<PostAction>) {
    if (field.postAction) {
      onUpdate({ postAction: { ...field.postAction, ...updates } });
    }
  }

  const isContentType = field.valueType === 'title' || field.valueType === 'desc';
  const currentPostActionType = field.postAction?.type || 'none';

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

        {/* PostAction Section */}
        <div className="border-t border-zinc-700 pt-3">
          <button
            type="button"
            onClick={() => setPostActionExpanded(!postActionExpanded)}
            className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {postActionExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            PostAction
            {field.postAction && <span className="text-emerald-400">({field.postAction.type})</span>}
          </button>

          {postActionExpanded && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Action Type"
                value={currentPostActionType}
                onChange={handlePostActionTypeChange}
                options={postActionTypeOptions}
              />

              {/* Conditional inputs based on action type */}
              {(currentPostActionType === 'click' || currentPostActionType === 'focus') && (
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Target Selector</label>
                  <input
                    type="text"
                    value={field.postAction?.selector ?? ''}
                    onChange={(e) => updatePostAction({ selector: e.target.value })}
                    placeholder="#submit-btn or .next-button"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              )}

              {currentPostActionType === 'pressKey' && (
                <Select
                  label="Key"
                  value={field.postAction?.key ?? 'Enter'}
                  onChange={(value) => updatePostAction({ key: value })}
                  options={keyOptions}
                />
              )}

              {currentPostActionType === 'wait' && (
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Delay (ms)</label>
                  <input
                    type="number"
                    value={field.postAction?.delay ?? 500}
                    onChange={(e) => updatePostAction({ delay: parseInt(e.target.value, 10) || 0 })}
                    placeholder="500"
                    min={0}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Rule-level PostAction Row Component (Sortable)
interface PostActionRowProps {
  action: PostAction;
  onUpdate: (updates: Partial<PostAction>) => void;
  onRemove: () => void;
}

const rulePostActionTypeOptions = [
  { value: 'click', label: 'Click' },
  { value: 'focus', label: 'Focus' },
  { value: 'pressKey', label: 'Press Key' },
  { value: 'wait', label: 'Wait' },
];

function PostActionRow({ action, onUpdate, onRemove }: PostActionRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function handleTypeChange(type: string) {
    const updates: Partial<PostAction> = {
      type: type as PostActionType,
      selector: type === 'click' || type === 'focus' ? '' : undefined,
      key: type === 'pressKey' ? 'Enter' : undefined,
      delay: type === 'wait' ? 500 : undefined,
    };
    onUpdate(updates);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700"
    >
      {/* Drag handle */}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
        title="Drag to reorder"
      >
        <Grip className="w-4 h-4" />
      </Button>

      {/* Action type dropdown */}
      <Select
        value={action.type}
        onChange={handleTypeChange}
        options={rulePostActionTypeOptions}
        className="w-32"
      />

      {/* Conditional inputs */}
      {(action.type === 'click' || action.type === 'focus') && (
        <input
          type="text"
          value={action.selector ?? ''}
          onChange={(e) => onUpdate({ selector: e.target.value })}
          placeholder="#submit-btn"
          className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
        />
      )}

      {action.type === 'pressKey' && (
        <Select
          value={action.key ?? 'Enter'}
          onChange={(value) => onUpdate({ key: value })}
          options={keyOptions}
          className="flex-1"
        />
      )}

      {action.type === 'wait' && (
        <div className="flex items-center gap-2 flex-1">
          <input
            type="number"
            value={action.delay ?? 500}
            onChange={(e) => onUpdate({ delay: parseInt(e.target.value, 10) || 0 })}
            min={0}
            className="w-24 px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <span className="text-zinc-400 text-sm">ms</span>
        </div>
      )}

      {/* Delete button */}
      <Button
        type="button"
        variant="danger"
        size="icon-sm"
        onClick={onRemove}
        title="Delete action"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
