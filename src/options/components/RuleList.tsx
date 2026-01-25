import {
  Copy,
  RotateCcw,
  SquarePen,
  Archive,
  Upload,
  Star,
  Folder,
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
  DefaultRuleMapping,
  Collection,
} from '@/shared/types';
import { DEFAULT_COLLECTION_ID } from '@/shared/config';
import { SmartPointerSensor } from '@/lib/dnd-sensors';
import {
  Button,
  Switch,
  Select,
} from '@/components';

interface RuleListProps {
  rules: FillRule[];
  collections?: Collection[];
  onEdit: (rule: FillRule) => void;
  onArchive: (id: string) => void;
  onResetIncrement: (id: string) => void;
  onDuplicate: (rule: FillRule) => void;
  onToggle: (id: string) => void;
  onExport: (rule: FillRule) => void;
  onReorder?: (ruleIds: string[]) => void;
  onMoveToCollection?: (ruleId: string, collectionId: string | null) => void;
  defaultMappings?: DefaultRuleMapping[];
  onSetDefault?: (rule: FillRule) => void;
  onRemoveDefault?: (urlPattern: string) => void;
}

export default function RuleList({
  rules,
  collections = [],
  onEdit,
  onArchive,
  onResetIncrement,
  onDuplicate,
  onToggle,
  onExport,
  onReorder,
  onMoveToCollection,
  defaultMappings = [],
  onSetDefault,
  onRemoveDefault,
}: RuleListProps) {
  // Drag and drop sensors (SmartPointerSensor ignores interactive elements, no keyboard to prevent SPACE/ENTER triggering drag)
  const sensors = useSensors(
    useSensor(SmartPointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts (allows clicks)
      },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id && onReorder) {
      const oldIndex = rules.findIndex((r) => r.id === active.id);
      const newIndex = rules.findIndex((r) => r.id === over.id);
      const newOrder = arrayMove(rules, oldIndex, newIndex);
      onReorder(newOrder.map((r) => r.id));
    }
  }

  // Check if a rule is set as default for its URL pattern
  function isDefaultForPattern(rule: FillRule): boolean {
    return defaultMappings.some(m => m.urlPattern === rule.urlPattern && m.ruleId === rule.id);
  }

  // Get collection name for a rule
  function getCollectionName(rule: FillRule): string {
    if (!rule.collectionId) {
      return 'Default';
    }
    const collection = collections.find(c => c.id === rule.collectionId);
    return collection?.name || 'Unknown';
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={rules.map((r) => r.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {rules.map((rule) => (
            <SortableRuleCard
              key={rule.id}
              rule={rule}
              collections={collections}
              isDefaultForPattern={isDefaultForPattern(rule)}
              getCollectionName={() => getCollectionName(rule)}
              onEdit={onEdit}
              onArchive={onArchive}
              onResetIncrement={onResetIncrement}
              onDuplicate={onDuplicate}
              onToggle={onToggle}
              onExport={onExport}
              onMoveToCollection={onMoveToCollection}
              onSetDefault={onSetDefault}
              onRemoveDefault={onRemoveDefault}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface SortableRuleCardProps {
  rule: FillRule;
  collections: Collection[];
  isDefaultForPattern: boolean;
  getCollectionName: () => string;
  onEdit: (rule: FillRule) => void;
  onArchive: (id: string) => void;
  onResetIncrement: (id: string) => void;
  onDuplicate: (rule: FillRule) => void;
  onToggle: (id: string) => void;
  onExport: (rule: FillRule) => void;
  onMoveToCollection?: (ruleId: string, collectionId: string | null) => void;
  onSetDefault?: (rule: FillRule) => void;
  onRemoveDefault?: (urlPattern: string) => void;
}

function SortableRuleCard({
  rule,
  collections,
  isDefaultForPattern,
  getCollectionName,
  onEdit,
  onArchive,
  onResetIncrement,
  onDuplicate,
  onToggle,
  onExport,
  onMoveToCollection,
  onSetDefault,
  onRemoveDefault,
}: SortableRuleCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  // Get current collection ID
  const currentCollectionId = rule.collectionId || DEFAULT_COLLECTION_ID;

  // Build collection options for Select
  const collectionOptions = [
    { value: DEFAULT_COLLECTION_ID, label: 'Default' },
    ...collections.map((col) => ({ value: col.id, label: col.name })),
  ];

  function handleCollectionChange(value: string) {
    if (onMoveToCollection) {
      onMoveToCollection(rule.id, value === DEFAULT_COLLECTION_ID ? null : value);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative p-4 pt-7 bg-zinc-900 rounded-xl border transition-colors cursor-grab active:cursor-grabbing touch-none ${rule.enabled ? 'border-zinc-800 hover:border-zinc-700' : 'border-zinc-800/50 opacity-60'}`}
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
        {onSetDefault && onRemoveDefault && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              isDefaultForPattern ? onRemoveDefault(rule.urlPattern) : onSetDefault(rule);
            }}
            title={isDefaultForPattern ? 'Remove as default for this URL pattern' : 'Set as default for this URL pattern'}
            className={isDefaultForPattern
              ? 'text-yellow-400 bg-yellow-500/20 hover:text-yellow-300 hover:bg-yellow-500/30'
              : 'hover:text-yellow-400 hover:bg-yellow-500/20'
            }
          >
            <Star className="w-3.5 h-3.5" fill={isDefaultForPattern ? 'currentColor' : 'none'} />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            onExport(rule);
          }}
          title="Export Rule"
          className="hover:text-violet-400 hover:bg-violet-500/20"
        >
          <Upload className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            onResetIncrement(rule.id);
          }}
          title="Reset Counter"
          className="hover:text-amber-400 hover:bg-amber-500/20"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(rule);
          }}
          title="Duplicate Rule"
          className="hover:text-fuchsia-400 hover:bg-fuchsia-500/20"
        >
          <Copy className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(rule);
          }}
          title="Edit Rule"
          className="hover:text-cyan-400 hover:bg-cyan-500/20"
        >
          <SquarePen className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            onArchive(rule.id);
          }}
          title="Archive Rule"
          className="hover:text-orange-400 hover:bg-orange-500/20"
        >
          <Archive className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-zinc-100 truncate mb-2">{rule.name || 'Unnamed Rule'}</h3>
        <p className="text-sm text-zinc-400 font-mono truncate mb-2">{rule.urlPattern}</p>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span>{rule.fields.length} field(s)</span>
          <span>Counter: {rule.incrementCounter}</span>
          {/* Collection selector */}
          {onMoveToCollection ? (
            <div onClick={(e) => e.stopPropagation()}>
              <Select
                value={currentCollectionId}
                options={collectionOptions}
                onChange={handleCollectionChange}
              >
                <span className="flex items-center gap-1 hover:text-zinc-300 transition-colors">
                  <Folder className="w-3 h-3" />
                  {getCollectionName()}
                </span>
              </Select>
            </div>
          ) : (
            <span className="flex items-center gap-1">
              <Folder className="w-3 h-3" />
              {getCollectionName()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
