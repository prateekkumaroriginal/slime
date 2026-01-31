import {
  useState,
  useEffect,
  useRef,
  useEffectEvent,
  useMemo,
} from 'react';
import {
  Plus,
  Trash2,
  Archive,
  RefreshCcw,
  ChevronDown,
  ChevronRight,
  Grip,
  Upload,
  X,
  Copy,
  Repeat,
  Users,
  Star,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type {
  FillRule,
  FieldMapping,
  MatchType,
  ValueType,
  PostAction,
  PostActionType,
  StoredImage,
  RepeatGroup,
  RepeatGroupField,
  RowData,
  Variant,
} from '@/shared/types';
import {
  generateId,
  getAllImages,
  saveImage,
  getImage,
  canStoreImage,
  formatBytes,
  getImageStorageUsage,
} from '@/storage/rules';
import { SmartPointerSensor } from '@/lib/dnd-sensors';
import {
  Button,
  Input,
  Select,
  Checkbox,
  Card,
} from '@/components';

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

// Helper to ensure a rule always has at least a primary variant
function ensurePrimaryVariant(rule: FillRule): FillRule {
  if (rule.variants && rule.variants.length > 0) {
    return rule;
  }
  
  // Create primary variant from current field values
  const fieldValues: Record<string, string> = {};
  for (const field of rule.fields) {
    fieldValues[field.id] = field.value;
  }
  
  // Collect repeat group data
  const repeatGroupData: Record<string, RowData[]> = {};
  if (rule.repeatGroups) {
    for (const group of rule.repeatGroups) {
      repeatGroupData[group.id] = group.rows.map(row => ({
        id: row.id,
        values: { ...row.values },
      }));
    }
  }
  
  const primaryVariant: Variant = {
    id: generateId(),
    name: 'Default',
    fieldValues,
    repeatGroupData: Object.keys(repeatGroupData).length > 0 ? repeatGroupData : undefined,
  };
  
  return {
    ...rule,
    variants: [primaryVariant],
    activeVariantId: primaryVariant.id,
  };
}

export default function RuleForm({ rule, onSave, onCancel, isNew, isHelpOpen, isArchivedSidebarOpen, onArchive, onRestore, onPermanentDelete }: RuleFormProps) {
  // Ensure rule always has a primary variant - compute once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialRule = useMemo(() => ensurePrimaryVariant(rule), [rule.id]);
  
  const [formData, setFormData] = useState<FillRule>(initialRule);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Variant editing state - always editing a variant (primary by default)
  const [editingVariantId, setEditingVariantId] = useState<string>(initialRule.variants![0].id);
  
  // Reset state when rule changes (different rule selected for editing)
  useEffect(() => {
    setFormData(initialRule);
    setEditingVariantId(initialRule.variants![0].id);
  }, [initialRule]);
  
  // Get the currently editing variant object
  const editingVariant = formData.variants?.find(v => v.id === editingVariantId) ?? formData.variants![0];
  
  // Primary variant is the first one in the array (always exists)
  const primaryVariant = formData.variants![0];
  const isPrimaryVariant = editingVariantId === primaryVariant.id;
  
  // Can edit structure only when editing the primary variant
  const canEditStructure = isPrimaryVariant;
  
  // Variant dropdown is open
  const [variantDropdownOpen, setVariantDropdownOpen] = useState(false);
  const variantDropdownRef = useRef<HTMLDivElement>(null);
  
  // Close variant dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (variantDropdownRef.current && !variantDropdownRef.current.contains(event.target as Node)) {
        setVariantDropdownOpen(false);
      }
    }
    
    if (variantDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [variantDropdownOpen]);

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
    setFormData((prev) => ({
      ...prev,
      fields: [...prev.fields, newMapping],
      // Add empty value for new field to all variants
      variants: prev.variants!.map((v) => ({
        ...v,
        fieldValues: { ...v.fieldValues, [newMapping.id]: '' },
      })),
    }));
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
      // Remove field value from all variants
      variants: prev.variants!.map((v) => {
        const { [id]: _, ...restFieldValues } = v.fieldValues;
        return { ...v, fieldValues: restFieldValues };
      }),
    }));
  }

  function duplicateFieldMapping(id: string) {
    setFormData((prev) => {
      const fieldToDuplicate = prev.fields.find((f) => f.id === id);
      if (!fieldToDuplicate) return prev;

      const duplicatedField: FieldMapping = {
        ...fieldToDuplicate,
        id: generateId(),
        postActions: fieldToDuplicate.postActions?.map((a) => ({
          ...a,
          id: generateId(),
        })),
      };

      // Insert the duplicate right after the original
      const index = prev.fields.findIndex((f) => f.id === id);
      const newFields = [...prev.fields];
      newFields.splice(index + 1, 0, duplicatedField);

      // Copy field values to all variants
      const newVariants = prev.variants!.map((v) => ({
        ...v,
        fieldValues: {
          ...v.fieldValues,
          [duplicatedField.id]: v.fieldValues[id] ?? '',
        },
      }));

      return { ...prev, fields: newFields, variants: newVariants };
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Variant Management
  // ─────────────────────────────────────────────────────────────────────────────

  // Create a new variant from the primary variant's values
  function createNewVariant(name: string) {
    const fieldValues: Record<string, string> = {};
    
    // Copy from primary variant's values
    for (const field of formData.fields) {
      fieldValues[field.id] = primaryVariant.fieldValues[field.id] ?? field.value;
    }

    // Copy repeat group data from primary variant
    const repeatGroupData: Record<string, RowData[]> = {};
    if (formData.repeatGroups) {
      for (const group of formData.repeatGroups) {
        const sourceRows = primaryVariant.repeatGroupData?.[group.id] ?? group.rows;
        repeatGroupData[group.id] = sourceRows.map(row => ({
          id: generateId(),
          values: { ...row.values },
        }));
      }
    }

    const newVariant: Variant = {
      id: generateId(),
      name,
      fieldValues,
      repeatGroupData: Object.keys(repeatGroupData).length > 0 ? repeatGroupData : undefined,
    };

    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants!, newVariant],
    }));

    // Switch to editing the new variant
    setEditingVariantId(newVariant.id);
  }

  // Update a variant's field value
  function updateVariantFieldValue(variantId: string, fieldId: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants?.map((v) =>
        v.id === variantId
          ? { ...v, fieldValues: { ...v.fieldValues, [fieldId]: value } }
          : v
      ),
    }));
  }

  // Delete a variant (cannot delete primary)
  function deleteVariantById(variantId: string) {
    // Cannot delete primary variant
    if (variantId === primaryVariant.id) return;
    
    setFormData((prev) => {
      const newVariants = prev.variants!.filter((v) => v.id !== variantId);
      let newActiveVariantId = prev.activeVariantId;
      
      // If deleting the active variant, switch to primary
      if (prev.activeVariantId === variantId) {
        newActiveVariantId = newVariants[0].id;
      }

      return {
        ...prev,
        variants: newVariants,
        activeVariantId: newActiveVariantId,
      };
    });

    // If we were editing this variant, switch to primary
    if (editingVariantId === variantId) {
      setEditingVariantId(primaryVariant.id);
    }
  }

  // Duplicate a variant
  function duplicateVariant(variantId: string) {
    const variantToDuplicate = formData.variants?.find((v) => v.id === variantId);
    if (!variantToDuplicate) return;

    const newVariant: Variant = {
      ...variantToDuplicate,
      id: generateId(),
      name: `${variantToDuplicate.name} (copy)`,
      fieldValues: { ...variantToDuplicate.fieldValues },
      repeatGroupData: variantToDuplicate.repeatGroupData
        ? Object.fromEntries(
            Object.entries(variantToDuplicate.repeatGroupData).map(([groupId, rows]) => [
              groupId,
              rows.map((row) => ({ id: generateId(), values: { ...row.values } })),
            ])
          )
        : undefined,
    };

    setFormData((prev) => ({
      ...prev,
      variants: [...(prev.variants ?? []), newVariant],
    }));

    setEditingVariantId(newVariant.id);
  }

  // Set the active variant
  function setActiveVariantId(variantId: string) {
    setFormData((prev) => ({
      ...prev,
      activeVariantId: variantId,
    }));
  }

  // Handle value change - always update the current variant
  function handleFieldValueChange(fieldId: string, value: string) {
    updateVariantFieldValue(editingVariantId, fieldId, value);
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Repeat Groups Management
  // ─────────────────────────────────────────────────────────────────────────────

  function addRepeatGroup() {
    const newGroup: RepeatGroup = {
      id: generateId(),
      name: 'New Repeat Group',
      rowSelector: '',
      fields: [],
      rows: [],
    };
    setFormData((prev) => ({
      ...prev,
      repeatGroups: [...(prev.repeatGroups ?? []), newGroup],
      // Initialize empty repeat group data for all variants
      variants: prev.variants!.map((v) => ({
        ...v,
        repeatGroupData: {
          ...v.repeatGroupData,
          [newGroup.id]: [],
        },
      })),
    }));
  }

  function updateRepeatGroup(groupId: string, updates: Partial<RepeatGroup>) {
    setFormData((prev) => ({
      ...prev,
      repeatGroups: prev.repeatGroups?.map((g) =>
        g.id === groupId ? { ...g, ...updates } : g
      ),
    }));
  }

  function removeRepeatGroup(groupId: string) {
    setFormData((prev) => ({
      ...prev,
      repeatGroups: prev.repeatGroups?.filter((g) => g.id !== groupId),
      // Remove repeat group data from all variants
      variants: prev.variants!.map((v) => {
        if (!v.repeatGroupData) return v;
        const { [groupId]: _, ...restGroupData } = v.repeatGroupData;
        return {
          ...v,
          repeatGroupData: Object.keys(restGroupData).length > 0 ? restGroupData : undefined,
        };
      }),
    }));
  }

  function addRepeatGroupField(groupId: string) {
    const newField: RepeatGroupField = {
      id: generateId(),
      label: '',
      selector: '',
      matchType: 'querySelector',
    };
    setFormData((prev) => ({
      ...prev,
      repeatGroups: prev.repeatGroups?.map((g) =>
        g.id === groupId
          ? { ...g, fields: [...g.fields, newField] }
          : g
      ),
    }));
  }

  function updateRepeatGroupField(
    groupId: string,
    fieldId: string,
    updates: Partial<RepeatGroupField>
  ) {
    setFormData((prev) => ({
      ...prev,
      repeatGroups: prev.repeatGroups?.map((g) =>
        g.id === groupId
          ? {
              ...g,
              fields: g.fields.map((f) =>
                f.id === fieldId ? { ...f, ...updates } : f
              ),
            }
          : g
      ),
    }));
  }

  function removeRepeatGroupField(groupId: string, fieldId: string) {
    setFormData((prev) => ({
      ...prev,
      repeatGroups: prev.repeatGroups?.map((g) =>
        g.id === groupId
          ? {
              ...g,
              fields: g.fields.filter((f) => f.id !== fieldId),
              // Also remove this field's values from all rows
              rows: g.rows.map((row) => {
                const newValues = { ...row.values };
                delete newValues[fieldId];
                return { ...row, values: newValues };
              }),
            }
          : g
      ),
    }));
  }

  function addRepeatGroupRow(groupId: string) {
    const group = formData.repeatGroups?.find((g) => g.id === groupId);
    if (!group) return;

    // Create a new row with empty values for each field
    const values: Record<string, string> = {};
    for (const field of group.fields) {
      values[field.id] = '';
    }

    const newRow: RowData = {
      id: generateId(),
      values,
    };

    // Add row to the current variant's repeatGroupData
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants!.map((v) =>
        v.id === editingVariantId
          ? {
              ...v,
              repeatGroupData: {
                ...v.repeatGroupData,
                [groupId]: [...(v.repeatGroupData?.[groupId] ?? []), newRow],
              },
            }
          : v
      ),
    }));
  }

  function updateRepeatGroupRowValue(
    groupId: string,
    rowId: string,
    fieldId: string,
    value: string
  ) {
    // Update the current variant's repeatGroupData
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants!.map((v) =>
        v.id === editingVariantId
          ? {
              ...v,
              repeatGroupData: {
                ...v.repeatGroupData,
                [groupId]: (v.repeatGroupData?.[groupId] ?? []).map((row) =>
                  row.id === rowId
                    ? { ...row, values: { ...row.values, [fieldId]: value } }
                    : row
                ),
              },
            }
          : v
      ),
    }));
  }

  function removeRepeatGroupRow(groupId: string, rowId: string) {
    // Remove row from the current variant's repeatGroupData
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants!.map((v) =>
        v.id === editingVariantId
          ? {
              ...v,
              repeatGroupData: {
                ...v.repeatGroupData,
                [groupId]: (v.repeatGroupData?.[groupId] ?? []).filter((r) => r.id !== rowId),
              },
            }
          : v
      ),
    }));
  }

  function reorderRepeatGroupRows(groupId: string, oldIndex: number, newIndex: number) {
    // Reorder rows in the current variant's repeatGroupData
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants!.map((v) =>
        v.id === editingVariantId
          ? {
              ...v,
              repeatGroupData: {
                ...v.repeatGroupData,
                [groupId]: arrayMove(v.repeatGroupData?.[groupId] ?? [], oldIndex, newIndex),
              },
            }
          : v
      ),
    }));
  }

  // Drag and drop sensors for PostActions (pointer only, no keyboard to prevent SPACE/ENTER triggering drag)
  const sensors = useSensors(useSensor(SmartPointerSensor));

  // Drag and drop sensors for Fields (pointer only, no keyboard to prevent SPACE/ENTER triggering drag)
  const fieldSensors = useSensors(useSensor(SmartPointerSensor));

  function handleFieldsDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = formData.fields.findIndex((f) => f.id === active.id);
      const newIndex = formData.fields.findIndex((f) => f.id === over.id);
      setFormData((prev) => ({
        ...prev,
        fields: arrayMove(prev.fields, oldIndex, newIndex),
      }));
    }
  }

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
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-zinc-200">{isNew ? 'Create New Rule' : 'Edit Rule'}</h2>
          
          {/* Variant Dropdown */}
          <div className="relative" ref={variantDropdownRef}>
            <button
              type="button"
              onClick={() => setVariantDropdownOpen(!variantDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-zinc-800 border-zinc-600 hover:border-zinc-500 transition-colors"
            >
              <Users className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-zinc-200">
                {editingVariant.name}
                {isPrimaryVariant && (
                  <span className="ml-1.5 text-xs text-emerald-400">(primary)</span>
                )}
              </span>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${variantDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {variantDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 z-50 min-w-[200px] bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden">
                {/* Existing variants */}
                <div className="py-1">
                  {formData.variants!.map((variant, index) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => {
                        setEditingVariantId(variant.id);
                        setVariantDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors ${
                        editingVariantId === variant.id
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {variant.name}
                        {index === 0 && (
                          <span className="text-xs px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">primary</span>
                        )}
                      </span>
                      {formData.activeVariantId === variant.id && (
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Divider */}
                <div className="border-t border-zinc-700" />
                
                {/* Actions */}
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      createNewVariant(`Variant ${formData.variants!.length + 1}`);
                      setVariantDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Variant
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      duplicateVariant(editingVariantId);
                      setVariantDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate Current
                  </button>
                  
                  {formData.activeVariantId !== editingVariantId && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveVariantId(editingVariantId);
                        setVariantDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
                    >
                      <Star className="w-4 h-4" />
                      Set as Default
                    </button>
                  )}
                  
                  {!isPrimaryVariant && (
                    <button
                      type="button"
                      onClick={() => {
                        deleteVariantById(editingVariantId);
                        setVariantDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Variant
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
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
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-zinc-200">Field Mappings</h3>
            {!canEditStructure && (
              <span className="text-xs text-zinc-500">(values only)</span>
            )}
          </div>
          {canEditStructure && (
            <Button type="button" variant="secondary" size="sm" onClick={addFieldMapping}>
              <Plus className="w-4 h-4" />
              Add Field
            </Button>
          )}
        </div>

        {formData.fields.length === 0 ? (
          <p className="text-center py-8 text-zinc-500">No fields yet. Click "Add Field" to create one.</p>
        ) : (
          <DndContext sensors={fieldSensors} collisionDetection={closestCenter} onDragEnd={handleFieldsDragEnd}>
            <SortableContext items={formData.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {formData.fields.map((field, index) => (
                  <FieldMappingRow
                    key={field.id}
                    field={field}
                    index={index}
                    onUpdate={(updates) => updateFieldMapping(field.id, updates)}
                    onRemove={() => removeFieldMapping(field.id)}
                    onDuplicate={() => duplicateFieldMapping(field.id)}
                    editingVariant={editingVariant}
                    onVariantValueChange={(value) => handleFieldValueChange(field.id, value)}
                    canEditStructure={canEditStructure}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </Card>

      {/* Repeat Groups */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-medium text-zinc-200">Repeat Groups</h3>
            {!canEditStructure && (
              <span className="text-xs text-zinc-500">(data rows only)</span>
            )}
          </div>
          {canEditStructure && (
            <Button type="button" variant="secondary" size="sm" onClick={addRepeatGroup}>
              <Plus className="w-4 h-4" />
              Add Group
            </Button>
          )}
        </div>

        {(!formData.repeatGroups || formData.repeatGroups.length === 0) ? (
          <p className="text-center py-8 text-zinc-500">
            No repeat groups yet. Use repeat groups to fill multiple similar form rows (like multiple user entries).
          </p>
        ) : (
          <div className="space-y-4">
            {formData.repeatGroups.map((group) => (
              <RepeatGroupCard
                key={group.id}
                group={group}
                onUpdate={(updates) => updateRepeatGroup(group.id, updates)}
                onRemove={() => removeRepeatGroup(group.id)}
                onAddField={() => addRepeatGroupField(group.id)}
                onUpdateField={(fieldId, updates) =>
                  updateRepeatGroupField(group.id, fieldId, updates)
                }
                onRemoveField={(fieldId) =>
                  removeRepeatGroupField(group.id, fieldId)
                }
                onAddRow={() => addRepeatGroupRow(group.id)}
                onUpdateRowValue={(rowId, fieldId, value) =>
                  updateRepeatGroupRowValue(group.id, rowId, fieldId, value)
                }
                onRemoveRow={(rowId) => removeRepeatGroupRow(group.id, rowId)}
                onReorderRows={(oldIndex, newIndex) =>
                  reorderRepeatGroupRows(group.id, oldIndex, newIndex)
                }
                canEditStructure={canEditStructure}
                editingVariant={editingVariant}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Rule-level PostActions */}
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-zinc-200">PostActions (on complete)</h3>
          {canEditStructure && (
            <Button type="button" variant="secondary" size="sm" onClick={addPostAction}>
              <Plus className="w-4 h-4" />
              Add Action
            </Button>
          )}
        </div>

        {(!formData.postActions || formData.postActions.length === 0) ? (
          <p className="text-center py-8 text-zinc-500">
            {canEditStructure ? 'No post-actions yet. These run after all fields fill successfully.' : 'No post-actions configured.'}
          </p>
        ) : canEditStructure ? (
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
        ) : (
          <div className="space-y-2 opacity-60">
            {formData.postActions.map((action) => (
              <PostActionRowReadOnly key={action.id} action={action} />
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
  onDuplicate: () => void;
  editingVariant?: Variant | null;
  onVariantValueChange?: (value: string) => void;
  canEditStructure?: boolean;
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
  { value: 'image', label: 'Image' },
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

function FieldMappingRow({ field, index, onUpdate, onRemove, onDuplicate, editingVariant, onVariantValueChange, canEditStructure = true }: FieldMappingRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const [postActionsExpanded, setPostActionsExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<StoredImage | null>(null);
  const [allImages, setAllImages] = useState<StoredImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get the current value - from variant if editing, otherwise from field
  const currentValue = editingVariant 
    ? (editingVariant.fieldValues[field.id] ?? '')
    : field.value;
  
  // Handle value change - route to variant or field
  function handleValueChange(value: string) {
    if (editingVariant && onVariantValueChange) {
      onVariantValueChange(value);
    } else {
      onUpdate({ value });
    }
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  // Load images when component mounts or when field.imageId changes
  useEffect(() => {
    async function loadImages() {
      const images = await getAllImages();
      setAllImages(images);

      // Load selected image if imageId is set
      if (field.imageId) {
        const img = await getImage(field.imageId);
        setSelectedImage(img);
      } else {
        setSelectedImage(null);
      }
    }
    loadImages();
  }, [field.imageId]);

  // Drag and drop sensors for field-level postActions (pointer only, no keyboard to prevent SPACE/ENTER triggering drag)
  const postActionSensors = useSensors(useSensor(SmartPointerSensor));

  // Handle value type change
  function handleValueTypeChange(newType: ValueType) {
    if (newType === 'title' || newType === 'desc') {
      // Auto-generate placeholder syntax
      const value = generatePlaceholderValue(newType, field.minLength, field.maxLength);
      onUpdate({ valueType: newType, value, imageId: undefined });
    } else if (newType === 'image') {
      // Clear value and set image type
      onUpdate({ valueType: newType, value: '', minLength: undefined, maxLength: undefined });
    } else {
      // Clear min/max and imageId when switching to static/template
      onUpdate({ valueType: newType, value: '', minLength: undefined, maxLength: undefined, imageId: undefined });
    }
  }

  // Handle image file upload
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Check storage limit
      const canStore = await canStoreImage(file.size);
      if (!canStore) {
        const { used, limit } = await getImageStorageUsage();
        setUploadError(`Storage limit exceeded (${formatBytes(used)} / ${formatBytes(limit)}). Delete some images or increase the limit in settings.`);
        return;
      }

      const imageId = await saveImage(file);
      onUpdate({ imageId });

      // Refresh images list
      const images = await getAllImages();
      setAllImages(images);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  // Handle selecting an existing image
  function handleSelectExistingImage(imageId: string) {
    onUpdate({ imageId });
  }

  // Handle clearing the selected image
  function handleClearImage() {
    onUpdate({ imageId: undefined });
    setSelectedImage(null);
  }

  // Handle min/max changes for title/desc
  function handleMinMaxChange(minLength?: number, maxLength?: number) {
    const value = generatePlaceholderValue(field.valueType, minLength, maxLength);
    onUpdate({ minLength, maxLength, value });
  }

  // Field-level PostActions management
  function addFieldPostAction() {
    const newAction: PostAction = {
      id: generateId(),
      type: 'wait',
      delay: 500,
    };
    onUpdate({ postActions: [...(field.postActions ?? []), newAction] });
    setPostActionsExpanded(true);
  }

  function updateFieldPostAction(id: string, updates: Partial<PostAction>) {
    onUpdate({
      postActions: field.postActions?.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    });
  }

  function removeFieldPostAction(id: string) {
    const updated = field.postActions?.filter((a) => a.id !== id);
    onUpdate({ postActions: updated && updated.length > 0 ? updated : undefined });
  }

  function handleFieldPostActionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id && field.postActions) {
      const oldIndex = field.postActions.findIndex((a) => a.id === active.id);
      const newIndex = field.postActions.findIndex((a) => a.id === over.id);
      onUpdate({
        postActions: arrayMove(field.postActions, oldIndex, newIndex),
      });
    }
  }

  const isContentType = field.valueType === 'title' || field.valueType === 'desc';
  const isImageType = field.valueType === 'image';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(canEditStructure ? { ...attributes, ...listeners } : {})}
      className={`relative p-4 pt-10 bg-zinc-800 rounded-lg border border-zinc-700 ${
        canEditStructure ? 'cursor-grab active:cursor-grabbing touch-none' : ''
      }`}
    >
      {/* Top bar with number, duplicate and delete */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between">
        <span className="px-3 py-1 bg-zinc-700 text-zinc-400 text-xs font-medium rounded-tl-md rounded-br-md">
          {index + 1}
        </span>
        {canEditStructure && (
          <div className="flex items-center">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              className="px-2 py-1 bg-zinc-700 text-zinc-400 hover:text-fuchsia-400 hover:bg-fuchsia-500/20 rounded-bl-md transition-colors"
              title="Duplicate Field"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="px-2 py-1 bg-zinc-700 text-zinc-400 hover:text-red-400 hover:bg-red-500/20 rounded-tr-md transition-colors"
              title="Delete Field"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
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
            disabled={!canEditStructure}
          />

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Selector</label>
            <input
              type="text"
              value={field.selector}
              onChange={(e) => onUpdate({ selector: e.target.value })}
              placeholder={getSelectorPlaceholder(field.matchType)}
              disabled={!canEditStructure}
              className={`w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono ${
                !canEditStructure ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            />
          </div>

          <Select
            label="Value Type"
            value={field.valueType}
            onChange={(value) => handleValueTypeChange(value as ValueType)}
            options={valueTypeOptions}
            disabled={!canEditStructure}
          />
        </div>

        {/* Row 2: Value input, Min/Max inputs, or Image selector */}
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
        ) : isImageType ? (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-zinc-400 mb-1">Image</label>

            {/* Selected image preview */}
            {selectedImage ? (
              <div className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-600 rounded-lg">
                <img
                  src={selectedImage.dataUrl}
                  alt={selectedImage.name}
                  className="w-12 h-12 object-cover rounded border border-zinc-600"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200 truncate">{selectedImage.name}</p>
                  <p className="text-xs text-zinc-500">{formatBytes(selectedImage.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Upload new image */}
                <div
                  className="relative border-2 border-dashed border-zinc-600 rounded-lg p-4 hover:border-emerald-500 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-2 text-center">
                    {isUploading ? (
                      <div className="w-6 h-6 border-2 border-zinc-600 border-t-emerald-500 rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 text-zinc-400" />
                    )}
                    <span className="text-sm text-zinc-400">
                      {isUploading ? 'Uploading...' : 'Click to upload image'}
                    </span>
                  </div>
                </div>

                {/* Error message */}
                {uploadError && (
                  <p className="text-xs text-red-400">{uploadError}</p>
                )}

                {/* Select from existing images */}
                {allImages.length > 0 && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-2">Or select from library:</p>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                      {allImages.map((img) => (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => handleSelectExistingImage(img.id)}
                          className="relative group"
                          title={`${img.name} (${formatBytes(img.size)})`}
                        >
                          <img
                            src={img.dataUrl}
                            alt={img.name}
                            className="w-10 h-10 object-cover rounded border border-zinc-600 hover:border-emerald-500 transition-colors"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              {field.valueType === 'template' ? 'Value (use {{placeholders}})' : 'Value'}
            </label>
            <input
              type="text"
              value={currentValue}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={field.valueType === 'template' ? 'user_{{inc}}@test.com' : 'john@example.com'}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}

        {/* PostActions Section */}
        <div className="border-t border-zinc-700 pt-3">
          <div className="flex items-center justify-between mb-2 h-[30px]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPostActionsExpanded(!postActionsExpanded)}
              className="p-0 bg-transparent hover:bg-transparent text-xs font-medium text-zinc-400 hover:text-zinc-200"
            >
              {postActionsExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              PostActions
              {field.postActions && field.postActions.length > 0 && (
                <span className="text-emerald-400">({field.postActions.length})</span>
              )}
            </Button>
            {postActionsExpanded && canEditStructure && (
              <Button type="button" variant="secondary" size="sm" onClick={addFieldPostAction}>
                <Plus className="w-3 h-3" />
                Add Action
              </Button>
            )}
          </div>

          {postActionsExpanded && (
            <div className="mt-3">
              {(!field.postActions || field.postActions.length === 0) ? (
                <p className="text-center py-4 text-zinc-500 text-xs">
                  {canEditStructure ? 'No post-actions yet. These run after this field fills successfully.' : 'No post-actions configured.'}
                </p>
              ) : canEditStructure ? (
                <DndContext sensors={postActionSensors} collisionDetection={closestCenter} onDragEnd={handleFieldPostActionDragEnd}>
                  <SortableContext items={field.postActions.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {field.postActions.map((action) => (
                        <FieldPostActionRow
                          key={action.id}
                          action={action}
                          onUpdate={(updates) => updateFieldPostAction(action.id, updates)}
                          onRemove={() => removeFieldPostAction(action.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="space-y-2 opacity-60">
                  {field.postActions.map((action) => (
                    <FieldPostActionRowReadOnly key={action.id} action={action} />
                  ))}
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
      <div
        {...attributes}
        {...listeners}
        className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 cursor-grab active:cursor-grabbing touch-none"
        title="Drag to reorder"
      >
        <Grip className="w-4 h-4" />
      </div>

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

// Rule-level PostAction Row Component (Read-only)
function PostActionRowReadOnly({ action }: { action: PostAction }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
      <span className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-400 text-sm">
        {rulePostActionTypeOptions.find(o => o.value === action.type)?.label ?? action.type}
      </span>

      {(action.type === 'click' || action.type === 'focus') && (
        <span className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-400 text-sm font-mono truncate">
          {action.selector || '(no selector)'}
        </span>
      )}

      {action.type === 'pressKey' && (
        <span className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-400 text-sm">
          {keyOptions.find(o => o.value === action.key)?.label ?? action.key}
        </span>
      )}

      {action.type === 'wait' && (
        <span className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-400 text-sm">
          {action.delay ?? 500} ms
        </span>
      )}
    </div>
  );
}

// Field-level PostAction Row Component (Sortable)
interface FieldPostActionRowProps {
  action: PostAction;
  onUpdate: (updates: Partial<PostAction>) => void;
  onRemove: () => void;
}

function FieldPostActionRow({ action, onUpdate, onRemove }: FieldPostActionRowProps) {
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
      className="flex items-center gap-2 p-2 bg-zinc-900 rounded-lg border border-zinc-600"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="p-1 rounded text-zinc-400 hover:text-zinc-200 cursor-grab active:cursor-grabbing touch-none"
        title="Drag to reorder"
      >
        <Grip className="w-3 h-3" />
      </div>

      {/* Action type dropdown */}
      <Select
        value={action.type}
        onChange={handleTypeChange}
        options={rulePostActionTypeOptions}
        className="w-28"
      />

      {/* Conditional inputs */}
      {(action.type === 'click' || action.type === 'focus') && (
        <input
          type="text"
          value={action.selector ?? ''}
          onChange={(e) => onUpdate({ selector: e.target.value })}
          placeholder="#submit-btn"
          className="flex-1 px-2 py-1.5 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-100 text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
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
            className="w-20 px-2 py-1.5 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <span className="text-zinc-400 text-xs">ms</span>
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
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}

// Field-level PostAction Row Component (Read-only)
function FieldPostActionRowReadOnly({ action }: { action: PostAction }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-zinc-900 rounded-lg border border-zinc-700">
      <span className="px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 text-xs">
        {rulePostActionTypeOptions.find(o => o.value === action.type)?.label ?? action.type}
      </span>

      {(action.type === 'click' || action.type === 'focus') && (
        <span className="flex-1 px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 text-xs font-mono truncate">
          {action.selector || '(no selector)'}
        </span>
      )}

      {action.type === 'pressKey' && (
        <span className="flex-1 px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 text-xs">
          {keyOptions.find(o => o.value === action.key)?.label ?? action.key}
        </span>
      )}

      {action.type === 'wait' && (
        <span className="flex-1 px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 text-xs">
          {action.delay ?? 500} ms
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Repeat Group Card Component
// ─────────────────────────────────────────────────────────────────────────────

interface RepeatGroupCardProps {
  group: RepeatGroup;
  onUpdate: (updates: Partial<RepeatGroup>) => void;
  onRemove: () => void;
  onAddField: () => void;
  onUpdateField: (fieldId: string, updates: Partial<RepeatGroupField>) => void;
  onRemoveField: (fieldId: string) => void;
  onAddRow: () => void;
  onUpdateRowValue: (rowId: string, fieldId: string, value: string) => void;
  onRemoveRow: (rowId: string) => void;
  onReorderRows: (oldIndex: number, newIndex: number) => void;
  canEditStructure?: boolean;
  editingVariant?: Variant | null;
}

function RepeatGroupCard({
  group,
  onUpdate,
  onRemove,
  onAddField,
  onUpdateField,
  onRemoveField,
  onAddRow,
  onUpdateRowValue,
  onRemoveRow,
  onReorderRows,
  canEditStructure = true,
  editingVariant,
}: RepeatGroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFieldsExpanded, setIsFieldsExpanded] = useState(true);
  const [isRowsExpanded, setIsRowsExpanded] = useState(true);

  // Drag and drop sensors for data rows
  const rowSensors = useSensors(useSensor(SmartPointerSensor));

  function handleRowDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = group.rows.findIndex((r) => r.id === active.id);
      const newIndex = group.rows.findIndex((r) => r.id === over.id);
      onReorderRows(oldIndex, newIndex);
    }
  }

  // Chunk fields into groups of 3 for data rows display
  const fieldChunks: RepeatGroupField[][] = [];
  for (let i = 0; i < group.fields.length; i += 3) {
    fieldChunks.push(group.fields.slice(i, i + 3));
  }

  // Get the rows to display - from variant if editing, otherwise from group
  const displayRows = editingVariant?.repeatGroupData?.[group.id] ?? group.rows;

  return (
    <div className="bg-zinc-800 rounded-lg border border-zinc-700">
      {/* Header */}
      <div className={`flex items-center justify-between p-3 ${isExpanded ? 'border-b border-zinc-700' : ''}`}>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-left"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          )}
          <span className="font-medium text-zinc-200">{group.name || 'Unnamed Group'}</span>
          <span className="text-xs text-zinc-500">
            ({group.fields.length} fields, {displayRows.length} rows)
          </span>
        </button>
        {canEditStructure && (
          <Button
            type="button"
            variant="danger"
            size="icon-sm"
            onClick={onRemove}
            title="Delete group"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Group Settings - matching FieldMapping style */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!canEditStructure ? 'opacity-60' : ''}`}>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Group Name</label>
              <input
                type="text"
                value={group.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                placeholder="e.g., User Entries"
                disabled={!canEditStructure}
                className={`w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  !canEditStructure ? 'cursor-not-allowed' : ''
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Row Selector</label>
              <input
                type="text"
                value={group.rowSelector}
                onChange={(e) => onUpdate({ rowSelector: e.target.value })}
                placeholder=".user-row, tr.data-row"
                disabled={!canEditStructure}
                className={`w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono ${
                  !canEditStructure ? 'cursor-not-allowed' : ''
                }`}
              />
              <p className="text-xs text-zinc-500 mt-1">CSS selector for each row container</p>
            </div>
          </div>

          {/* Field Definitions - Collapsible */}
          <div className="border-t border-zinc-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setIsFieldsExpanded(!isFieldsExpanded)}
                className="flex items-center gap-2 text-left"
              >
                {isFieldsExpanded ? (
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-zinc-400" />
                )}
                <h4 className="text-sm font-medium text-zinc-300">Field Definitions (columns)</h4>
                {group.fields.length > 0 && (
                  <span className="text-xs text-zinc-500">({group.fields.length})</span>
                )}
              </button>
              {isFieldsExpanded && canEditStructure && (
                <Button type="button" variant="secondary" size="sm" onClick={onAddField}>
                  <Plus className="w-3 h-3" />
                  Add Field
                </Button>
              )}
            </div>

            {isFieldsExpanded && (
              <>
                {group.fields.length === 0 ? (
                  <p className="text-center py-4 text-zinc-500 text-sm">
                    {canEditStructure ? 'No fields defined. Add fields to define what form elements to fill in each row.' : 'No fields defined.'}
                  </p>
                ) : canEditStructure ? (
                  <div className="space-y-3">
                    {group.fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="relative p-4 pt-10 bg-zinc-800 rounded-lg border border-zinc-700"
                      >
                        {/* Field number badge and delete button */}
                        <div className="absolute top-0 left-0 right-0 flex items-center justify-between">
                          <span className="px-3 py-1 bg-zinc-700 text-zinc-400 text-xs font-medium rounded-tl-md rounded-br-md">
                            {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveField(field.id)}
                            className="px-2 py-1 bg-zinc-700 text-zinc-400 hover:text-red-400 hover:bg-red-500/20 rounded-tr-md rounded-bl-md transition-colors"
                            title="Remove field"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Field inputs: Match By, Selector, Label */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Select
                            label="Match By"
                            value={field.matchType}
                            onChange={(value) =>
                              onUpdateField(field.id, { matchType: value as MatchType })
                            }
                            options={matchTypeOptions}
                          />
                          <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1">Selector</label>
                            <input
                              type="text"
                              value={field.selector}
                              onChange={(e) =>
                                onUpdateField(field.id, { selector: e.target.value })
                              }
                              placeholder="input[name*='name']"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1">Label</label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) =>
                                onUpdateField(field.id, { label: e.target.value })
                              }
                              placeholder="Name"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Read-only field definitions */
                  <div className="space-y-3 opacity-60">
                    {group.fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="relative p-4 pt-8 bg-zinc-800 rounded-lg border border-zinc-700"
                      >
                        <span className="absolute top-0 left-0 px-3 py-1 bg-zinc-700 text-zinc-400 text-xs font-medium rounded-tl-md rounded-br-md">
                          {index + 1}
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1">Match By</label>
                            <span className="block px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-400 text-sm">
                              {matchTypeOptions.find(o => o.value === field.matchType)?.label ?? field.matchType}
                            </span>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1">Selector</label>
                            <span className="block px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-400 text-sm font-mono truncate">
                              {field.selector || '(empty)'}
                            </span>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1">Label</label>
                            <span className="block px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-400 text-sm">
                              {field.label || '(unnamed)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Data Rows - Collapsible - Always visible */}
          {group.fields.length > 0 && (
            <div className={canEditStructure ? 'border-t border-zinc-700 pt-4' : ''}>
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => setIsRowsExpanded(!isRowsExpanded)}
                  className="flex items-center gap-2 text-left"
                >
                  {isRowsExpanded ? (
                    <ChevronDown className="w-3 h-3 text-zinc-400" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-zinc-400" />
                  )}
                  <h4 className="text-sm font-medium text-zinc-300">Data Rows</h4>
                  {displayRows.length > 0 && (
                    <span className="text-xs text-zinc-500">({displayRows.length})</span>
                  )}
                </button>
                {isRowsExpanded && (
                  <Button type="button" variant="secondary" size="sm" onClick={onAddRow}>
                    <Plus className="w-3 h-3" />
                    Add Row
                  </Button>
                )}
              </div>

              {isRowsExpanded && (
                <>
                  {displayRows.length === 0 ? (
                    <p className="text-center py-4 text-zinc-500 text-sm">
                      No data rows yet. Add rows to define the values to fill in each form row.
                    </p>
                  ) : (
                    <DndContext sensors={rowSensors} collisionDetection={closestCenter} onDragEnd={handleRowDragEnd}>
                      <SortableContext items={displayRows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3">
                          {displayRows.map((row, rowIndex) => (
                            <DataRowCard
                              key={row.id}
                              row={row}
                              rowIndex={rowIndex}
                              fieldChunks={fieldChunks}
                              onUpdateValue={(fieldId, value) => onUpdateRowValue(row.id, fieldId, value)}
                              onRemove={() => onRemoveRow(row.id)}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}

                  {displayRows.length > 0 && (
                    <p className="mt-2 text-xs text-zinc-500">
                      Tip: Values support templates like {"{{random:5}}"}, {"{{pick:a,b,c}}"}, or {"{{inc}}"}.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Data Row Card Component (Sortable)
// ─────────────────────────────────────────────────────────────────────────────

interface DataRowCardProps {
  row: RowData;
  rowIndex: number;
  fieldChunks: RepeatGroupField[][];
  onUpdateValue: (fieldId: string, value: string) => void;
  onRemove: () => void;
}

function DataRowCard({ row, rowIndex, fieldChunks, onUpdateValue, onRemove }: DataRowCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative p-4 pt-10 bg-zinc-800 rounded-lg border border-zinc-700 cursor-grab active:cursor-grabbing touch-none"
    >
      {/* Row number badge and delete button */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between">
        <span className="px-3 py-1 bg-zinc-700 text-zinc-400 text-xs font-medium rounded-tl-md rounded-br-md">
          {rowIndex + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="px-2 py-1 bg-zinc-700 text-zinc-400 hover:text-red-400 hover:bg-red-500/20 rounded-tr-md rounded-bl-md transition-colors"
          title="Remove row"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Value inputs - max 3 per row */}
      <div className="space-y-4">
        {fieldChunks.map((chunk, chunkIndex) => (
          <div key={chunkIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {chunk.map((field) => (
              <div key={field.id}>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  {field.label || '(unnamed)'}
                </label>
                <input
                  type="text"
                  value={row.values[field.id] ?? ''}
                  onChange={(e) => onUpdateValue(field.id, e.target.value)}
                  placeholder={field.label || 'Value'}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

