import {
  useState,
  useEffect,
  useRef,
  useEffectEvent,
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
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
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

      return { ...prev, fields: newFields };
    });
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

  // Drag and drop sensors for PostActions
  const sensors = useSensors(
    useSensor(SmartPointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Drag and drop sensors for Fields
  const fieldSensors = useSensors(
    useSensor(SmartPointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
  onDuplicate: () => void;
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

function FieldMappingRow({ field, index, onUpdate, onRemove, onDuplicate }: FieldMappingRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const [postActionsExpanded, setPostActionsExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<StoredImage | null>(null);
  const [allImages, setAllImages] = useState<StoredImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Drag and drop sensors for field-level postActions
  const postActionSensors = useSensors(
    useSensor(SmartPointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
      {...attributes}
      {...listeners}
      className="relative p-4 pt-10 bg-zinc-800 rounded-lg border border-zinc-700 cursor-grab active:cursor-grabbing touch-none"
    >
      {/* Top bar with number, duplicate and delete */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between">
        <span className="px-3 py-1 bg-zinc-700 text-zinc-400 text-xs font-medium rounded-tl-md rounded-br-md">
          {index + 1}
        </span>
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
              value={field.value}
              onChange={(e) => onUpdate({ value: e.target.value })}
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
            {postActionsExpanded && (
              <Button type="button" variant="secondary" size="sm" onClick={addFieldPostAction}>
                <Plus className="w-3 h-3" />
                Add Action
              </Button>
            )}
          </div>

          {postActionsExpanded && (
            <div className="mt-3">
              {(!field.postActions || field.postActions.length === 0) ? (
                <p className="text-center py-4 text-zinc-500 text-xs">No post-actions yet. These run after this field fills successfully.</p>
              ) : (
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
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
        title="Drag to reorder"
      >
        <Grip className="w-3 h-3" />
      </Button>

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
