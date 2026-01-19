import {
  useEffect,
  useState,
  useRef,
} from 'react';
import {
  Plus,
  FileText,
  Download,
  Upload,
  Menu,
  Zap,
  HardDrive,
} from 'lucide-react';
import type {
  FillRule,
  DefaultRuleMapping,
  Collection,
} from '@/shared/types';
import {
  SIDEBAR_PREFERENCE_KEY,
  DEFAULT_COLLECTION_ID,
} from '@/shared/config';
import {
  getActiveRules,
  getArchivedRules,
  addRule,
  updateRule,
  archiveRule,
  restoreRule,
  permanentlyDeleteRule,
  createEmptyRule,
  resetIncrement,
  exportRulesToJson,
  exportSingleRuleToJson,
  importRulesFromJson,
  ImportValidationError,
  toggleRule,
  generateId,
  getDefaultRuleMappings,
  setDefaultRuleForUrl,
  removeDefaultRuleForUrl,
  getCollections,
  getRulesForCollection,
  reorderRules,
  moveRuleToCollection,
} from '@/storage/rules';
import {
  Button,
  Card,
} from '@/components';
import RuleForm from './components/RuleForm';
import RuleList from './components/RuleList';
import SyntaxHelp from './components/SyntaxHelp';
import ArchivedRulesSidebar from './components/ArchivedRulesSidebar';
import CollectionSidebar from './components/CollectionSidebar';
import FabConfig from './components/FabConfig';
import ImageStorageConfig from './components/ImageStorageConfig';

export default function Options() {
  const [allRules, setAllRules] = useState<FillRule[]>([]);
  const [rules, setRules] = useState<FillRule[]>([]);
  const [archivedRules, setArchivedRules] = useState<FillRule[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [isCollectionSidebarOpen, setIsCollectionSidebarOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<FillRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showSyntaxHelp, setShowSyntaxHelp] = useState(false);
  const [isArchivedSidebarOpen, setIsArchivedSidebarOpen] = useState(false);
  const [showFabConfig, setShowFabConfig] = useState(false);
  const [showImageStorage, setShowImageStorage] = useState(false);
  const [defaultMappings, setDefaultMappings] = useState<DefaultRuleMapping[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadRules();
    loadCollections();
    loadDefaultMappings();
    loadSidebarPreference();
  }, []);

  async function loadSidebarPreference() {
    const result = await chrome.storage.local.get(SIDEBAR_PREFERENCE_KEY);
    if (typeof result[SIDEBAR_PREFERENCE_KEY] === 'boolean') {
      setIsCollectionSidebarOpen(result[SIDEBAR_PREFERENCE_KEY]);
    }
  }

  async function handleToggleCollectionSidebar() {
    const newState = !isCollectionSidebarOpen;
    setIsCollectionSidebarOpen(newState);
    await chrome.storage.local.set({ [SIDEBAR_PREFERENCE_KEY]: newState });
  }

  function getCollectionName(): string {
    if (selectedCollectionId === null) {
      return 'All Rules';
    }
    if (selectedCollectionId === DEFAULT_COLLECTION_ID) {
      return 'Default';
    }
    const collection = collections.find(c => c.id === selectedCollectionId);
    return collection?.name || 'Unknown';
  }

  useEffect(() => {
    filterRulesByCollection();
  }, [allRules, selectedCollectionId]);

  async function loadRules() {
    const activeRules = await getActiveRules();
    const archived = await getArchivedRules();
    setAllRules(activeRules);
    setArchivedRules(archived);
  }

  async function loadCollections() {
    const cols = await getCollections();
    setCollections(cols);
  }

  async function filterRulesByCollection() {
    if (selectedCollectionId === null) {
      // "All Rules" - show all active rules
      setRules(allRules);
    } else {
      // Filter by collection
      const filtered = await getRulesForCollection(selectedCollectionId);
      setRules(filtered.filter(r => !r.isArchived));
    }
  }

  async function loadDefaultMappings() {
    const mappings = await getDefaultRuleMappings();
    setDefaultMappings(mappings);
  }

  async function handleSetDefault(rule: FillRule) {
    if (confirm(`Set "${rule.name}" as default for URL pattern: ${rule.urlPattern}?`)) {
      await setDefaultRuleForUrl(rule.urlPattern, rule.id);
      await loadDefaultMappings();
    }
  }

  async function handleRemoveDefault(urlPattern: string) {
    if (confirm(`Remove default rule for URL pattern: ${urlPattern}?`)) {
      await removeDefaultRuleForUrl(urlPattern);
      await loadDefaultMappings();
    }
  }

  function handleCreate() {
    setEditingRule(createEmptyRule());
    setIsCreating(true);
  }

  function handleEdit(rule: FillRule) {
    setEditingRule({ ...rule });
    setIsCreating(false);
    if (isArchivedSidebarOpen) {
      setIsArchivedSidebarOpen(false);
    }
  }

  async function handleSave(rule: FillRule) {
    if (isCreating) {
      // Assign current collection to new rule (if not "All Rules" view)
      if (selectedCollectionId !== null && selectedCollectionId !== DEFAULT_COLLECTION_ID) {
        rule.collectionId = selectedCollectionId;
      } else {
        rule.collectionId = undefined; // Default collection
      }
      await addRule(rule);
    } else {
      await updateRule(rule);
    }
    await loadRules();
    setEditingRule(null);
    setIsCreating(false);
  }

  function handleCancel() {
    setEditingRule(null);
    setIsCreating(false);
  }

  async function handleArchive(id: string) {
    await archiveRule(id);
    await loadRules();
  }

  async function handleRestore(id: string) {
    await restoreRule(id);
    await loadRules();
  }

  async function handlePermanentDelete(id: string) {
    if (confirm('Are you sure you want to permanently delete this rule? This action cannot be undone.')) {
      await permanentlyDeleteRule(id);
      await loadRules();
    }
  }

  function handleToggleArchivedSidebar() {
    setIsArchivedSidebarOpen(!isArchivedSidebarOpen);
    if (!isArchivedSidebarOpen) {
      setShowSyntaxHelp(false);
    }
  }

  function handleToggleSyntaxHelp() {
    setShowSyntaxHelp(!showSyntaxHelp);
    if (!showSyntaxHelp) {
      setIsArchivedSidebarOpen(false);
    }
  }

  async function handleResetIncrement(id: string) {
    await resetIncrement(id);
    await loadRules();
  }

  async function handleToggle(id: string) {
    await toggleRule(id);
    await loadRules();
  }

  async function handleDuplicate(rule: FillRule) {
    const now = Date.now();
    const duplicatedRule: FillRule = {
      ...rule,
      id: generateId(),
      name: `${rule.name} (Copy)`,
      fields: rule.fields.map((f) => ({ ...f, id: generateId() })),
      incrementCounter: 1,
      createdAt: now,
      updatedAt: now,
    };
    await addRule(duplicatedRule);
    await loadRules();
  }

  async function handleReorder(ruleIds: string[]) {
    await reorderRules(ruleIds);
    await loadRules();
  }

  async function handleMoveToCollection(ruleId: string, collectionId: string | null) {
    await moveRuleToCollection(ruleId, collectionId);
    await loadRules();
  }

  async function handleExport() {
    try {
      const jsonString = await exportRulesToJson();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().split('T')[0];
      a.download = `slime-rules-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Failed to export rules: ${error}`);
    }
  }

  function handleExportSingle(rule: FillRule) {
    try {
      const jsonString = exportSingleRuleToJson(rule);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Sanitize rule name for filename
      const sanitizedName = rule.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'rule';
      const date = new Date().toISOString().split('T')[0];
      a.download = `slime-rule-${sanitizedName}-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Failed to export rule: ${error}`);
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const count = await importRulesFromJson(text);
      await loadRules();
      alert(`Successfully imported ${count} rule(s)`);
    } catch (error) {
      if (error instanceof ImportValidationError) {
        alert(`Import failed:\n${error.message}`);
      } else {
        alert(`Failed to import rules: ${error}`);
      }
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <CollectionSidebar
        collections={collections}
        rules={allRules}
        selectedCollectionId={selectedCollectionId}
        onSelectCollection={setSelectedCollectionId}
        onCollectionsChange={loadCollections}
        onRulesChange={loadRules}
        isOpen={isCollectionSidebarOpen}
        onToggle={handleToggleCollectionSidebar}
      />
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-[200px]">
        <header className="mb-10">
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-emerald-400">Slime</h1>
            {!isArchivedSidebarOpen && (
              <Button
                variant="secondary"
                size="icon"
                onClick={handleToggleArchivedSidebar}
                title="Show Archived Rules"
                className="rounded px-3"
              >
                <Menu className="w-5 h-5 text-zinc-300" />
              </Button>
            )}
          </div>
          <p className="text-zinc-400 mt-2">Manage your form filling rules and field mappings</p>
        </header>

        {showImageStorage ? (
          <ImageStorageConfig onBack={() => setShowImageStorage(false)} />
        ) : showFabConfig ? (
          <FabConfig onBack={() => setShowFabConfig(false)} />
        ) : editingRule ? (
          <RuleForm
            rule={editingRule}
            onSave={handleSave}
            onCancel={handleCancel}
            isNew={isCreating}
            isHelpOpen={showSyntaxHelp}
            isArchivedSidebarOpen={isArchivedSidebarOpen}
            onArchive={handleArchive}
            onRestore={handleRestore}
            onPermanentDelete={handlePermanentDelete}
          />
        ) : (
          <>
            <div className="flex flex-wrap gap-2 items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-zinc-200">{getCollectionName()}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="secondary" onClick={() => setShowFabConfig(true)}>
                  <Zap className="w-4 h-4" />
                  Action Button
                </Button>
                <Button variant="secondary" onClick={() => setShowImageStorage(true)}>
                  <HardDrive className="w-4 h-4" />
                  Image Storage
                </Button>
                <Button variant="secondary" onClick={handleExport}>
                  <Upload className="w-4 h-4" />
                  Export
                </Button>
                <Button variant="secondary" onClick={handleImportClick}>
                  <Download className="w-4 h-4" />
                  Import
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={handleImportFile}
                />
                <Button onClick={handleCreate}>
                  <Plus className="w-5 h-5" />
                  New Rule
                </Button>
              </div>
            </div>

            {rules.length === 0 ? (
              <Card className="items-center text-center py-16">
                <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-zinc-500" />
                </div>
                <h3 className="text-lg font-medium text-zinc-300">No rules yet</h3>
                <p className="text-zinc-500 -mt-2">Create your first rule to start auto-filling forms</p>
                <Button onClick={handleCreate}>Create Rule</Button>
              </Card>
            ) : (
              <RuleList
                rules={rules}
                collections={collections}
                onEdit={handleEdit}
                onArchive={handleArchive}
                onResetIncrement={handleResetIncrement}
                onDuplicate={handleDuplicate}
                onToggle={handleToggle}
                onExport={handleExportSingle}
                onReorder={handleReorder}
                onMoveToCollection={handleMoveToCollection}
                defaultMappings={defaultMappings}
                onSetDefault={handleSetDefault}
                onRemoveDefault={handleRemoveDefault}
              />
            )}
          </>
        )}
      </div>

      <SyntaxHelp isOpen={showSyntaxHelp && !isArchivedSidebarOpen} onToggle={handleToggleSyntaxHelp} canOpen={!isArchivedSidebarOpen} />
      <ArchivedRulesSidebar
        isOpen={isArchivedSidebarOpen}
        onToggle={handleToggleArchivedSidebar}
        archivedRules={archivedRules}
        onRestore={handleRestore}
        onEdit={handleEdit}
        onPermanentDelete={handlePermanentDelete}
        onExport={handleExportSingle}
      />
    </div>
  );
}
