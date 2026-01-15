import { useState } from 'react';
import { Plus, PanelLeftClose, PanelLeft, Layers, FolderOpen } from 'lucide-react';
import type { Collection, FillRule } from '@/shared/types';
import { DEFAULT_COLLECTION_ID } from '@/shared/config';
import { Button, Input } from '@/components';
import { addCollection, updateCollection, deleteCollection, exportCollectionToJson } from '@/storage/rules';
import CollectionSidebarItem from './CollectionSidebarItem';

interface CollectionSidebarProps {
  collections: Collection[];
  rules: FillRule[];
  selectedCollectionId: string | null;
  onSelectCollection: (id: string | null) => void;
  onCollectionsChange: () => void;
  onRulesChange: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function CollectionSidebar({
  collections,
  rules,
  selectedCollectionId,
  onSelectCollection,
  onCollectionsChange,
  onRulesChange,
  isOpen,
  onToggle,
}: CollectionSidebarProps) {
  const [isAddingCollection, setIsAddingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [deletingCollectionId, setDeletingCollectionId] = useState<string | null>(null);

  // Calculate rule counts
  const allRulesCount = rules.length;
  const defaultRulesCount = rules.filter(r => !r.collectionId).length;
  
  const getCollectionRuleCount = (collectionId: string): number => {
    return rules.filter(r => r.collectionId === collectionId).length;
  };

  async function handleAddCollection() {
    if (!newCollectionName.trim()) {
      return;
    }
    
    try {
      await addCollection(newCollectionName.trim());
      setNewCollectionName('');
      setIsAddingCollection(false);
      onCollectionsChange();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create collection');
    }
  }

  async function handleRenameCollection(id: string, newName: string) {
    await updateCollection(id, newName);
    onCollectionsChange();
  }

  async function handleDeleteCollection(collection: Collection) {
    const ruleCount = getCollectionRuleCount(collection.id);
    const message = ruleCount > 0
      ? `Delete "${collection.name}"? This will also delete ${ruleCount} rule(s).`
      : `Delete "${collection.name}"?`;
    
    if (confirm(message)) {
      setDeletingCollectionId(collection.id);
      try {
        await deleteCollection(collection.id);
        setDeletingCollectionId(null);
        onCollectionsChange();
        onRulesChange();
        
        // If deleted collection was selected, switch to "All Rules"
        if (selectedCollectionId === collection.id) {
          onSelectCollection(null);
        }
      } catch (error) {
        setDeletingCollectionId(null);
        alert(error instanceof Error ? error.message : 'Failed to delete collection');
      }
    }
  }

  async function handleExportCollection(collection: Collection) {
    try {
      const jsonString = await exportCollectionToJson(collection.id);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const sanitizedName = collection.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'collection';
      const date = new Date().toISOString().split('T')[0];
      a.download = `slime-collection-${sanitizedName}-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to export collection');
    }
  }

  return (
    <>
      {/* Toggle button when sidebar is closed */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="fixed top-4 left-4 z-20"
          title="Show Collections"
        >
          <PanelLeft className="w-5 h-5" />
        </Button>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-300 z-20 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-100">Collections</h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            title="Close sidebar"
          >
            <PanelLeftClose className="w-5 h-5" />
          </Button>
        </div>

        {/* Add Collection */}
        <div className="p-3 border-b border-zinc-800/50">
          {isAddingCollection ? (
            <div className="space-y-2">
              <Input
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCollection();
                  } else if (e.key === 'Escape') {
                    setIsAddingCollection(false);
                    setNewCollectionName('');
                  }
                }}
                placeholder="Collection name"
                className="text-sm"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddCollection}
                  className="flex-1"
                  disabled={!newCollectionName.trim()}
                >
                  Create
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsAddingCollection(false);
                    setNewCollectionName('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddingCollection(true)}
              className="w-full"
            >
              <Plus className="w-4 h-4" />
              New Collection
            </Button>
          )}
        </div>

        {/* Collections List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-0.5">
            {/* All Rules */}
            <div
              className={`flex items-center rounded-lg transition-colors h-9 ${
                selectedCollectionId === null
                  ? 'bg-emerald-500/15'
                  : 'hover:bg-zinc-900'
              }`}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectCollection(null)}
                className={`flex-1 justify-start gap-3 h-full ${
                  selectedCollectionId === null
                    ? 'text-emerald-400 hover:text-emerald-400 hover:bg-transparent'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-transparent'
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left font-medium">All Rules</span>
              </Button>
              <span className={`text-xs px-1.5 py-0.5 rounded mr-2 ${
                selectedCollectionId === null ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700/50 text-zinc-500'
              }`}>
                {allRulesCount}
              </span>
            </div>

            {/* Default */}
            <div
              className={`flex items-center rounded-lg transition-colors h-9 ${
                selectedCollectionId === DEFAULT_COLLECTION_ID
                  ? 'bg-emerald-500/15'
                  : 'hover:bg-zinc-900'
              }`}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectCollection(DEFAULT_COLLECTION_ID)}
                className={`flex-1 justify-start gap-3 h-full ${
                  selectedCollectionId === DEFAULT_COLLECTION_ID
                    ? 'text-emerald-400 hover:text-emerald-400 hover:bg-transparent'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-transparent'
                }`}
              >
                <FolderOpen className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left font-medium">Default</span>
              </Button>
              <span className={`text-xs px-1.5 py-0.5 rounded mr-2 ${
                selectedCollectionId === DEFAULT_COLLECTION_ID ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700/50 text-zinc-500'
              }`}>
                {defaultRulesCount}
              </span>
            </div>

            {/* Separator if there are user collections */}
            {collections.length > 0 && (
              <div className="my-2 border-t border-zinc-800/50" />
            )}

            {/* User Collections */}
            {collections.map((collection) => (
              <CollectionSidebarItem
                key={collection.id}
                collection={collection}
                isSelected={selectedCollectionId === collection.id}
                ruleCount={getCollectionRuleCount(collection.id)}
                onSelect={() => onSelectCollection(collection.id)}
                onRename={(newName) => handleRenameCollection(collection.id, newName)}
                onExport={() => handleExportCollection(collection)}
                onDelete={() => handleDeleteCollection(collection)}
                isDeleting={deletingCollectionId === collection.id}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
