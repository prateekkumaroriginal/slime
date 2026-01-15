import { useState } from 'react';
import { Folder, SquarePen, Trash2, Upload} from 'lucide-react';
import type { Collection } from '@/shared/types';
import { Button, Input } from '@/components';

interface CollectionSidebarItemProps {
  collection: Collection;
  isSelected: boolean;
  ruleCount: number;
  onSelect: () => void;
  onRename: (newName: string) => Promise<void>;
  onExport: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export default function CollectionSidebarItem({
  collection,
  isSelected,
  ruleCount,
  onSelect,
  onRename,
  onExport,
  onDelete,
  isDeleting = false,
}: CollectionSidebarItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState('');

  function handleStartEdit() {
    setIsEditing(true);
    setEditingName(collection.name);
  }

  async function handleSaveEdit() {
    if (!editingName.trim()) {
      setIsEditing(false);
      return;
    }
    
    try {
      await onRename(editingName.trim());
      setIsEditing(false);
      setEditingName('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to rename collection');
    }
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setEditingName('');
  }

  if (isEditing) {
    return (
      <div className="p-2 bg-zinc-800/50 rounded-lg space-y-2">
        <Input
          value={editingName}
          onChange={(e) => setEditingName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSaveEdit();
            } else if (e.key === 'Escape') {
              handleCancelEdit();
            }
          }}
          className="text-sm"
          autoFocus
        />
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveEdit}
            className="flex-1"
          >
            Save
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCancelEdit}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onSelect}
      className={`group w-full justify-start gap-3 h-9 pr-2 ${
        isSelected 
          ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15 hover:text-emerald-400' 
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
      }`}
    >
      <Folder className="w-4 h-4 shrink-0" />
      <span className="flex-1 text-left font-medium truncate">{collection.name}</span>
      
      {/* Rule count - hidden on hover */}
      <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 group-hover:hidden ${
        isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700/50 text-zinc-500'
      }`}>
        {ruleCount}
      </span>

      {/* Action buttons - shown on hover (export, edit, delete) */}
      <div className="hidden group-hover:flex items-center">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => { e.stopPropagation(); onExport(); }}
          title="Export"
          className="text-zinc-500 hover:text-violet-400 hover:bg-violet-500/20"
        >
          <Upload className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => { e.stopPropagation(); handleStartEdit(); }}
          title="Rename"
          className="text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/20"
        >
          <SquarePen className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          disabled={isDeleting}
          title="Delete"
          className="text-zinc-500 hover:text-red-400 hover:bg-red-500/20"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Button>
  );
}
