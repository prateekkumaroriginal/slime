import { useEffect, useState, useRef, useCallback } from 'react';
import { Plus, FileText, Download, Upload, Menu, Zap, HardDrive } from 'lucide-react';
import type { FillRule, DefaultRuleMapping } from '@/shared/types';
import { getActiveRules, getArchivedRules, addRule, updateRule, archiveRule, restoreRule, permanentlyDeleteRule, createEmptyRule, resetIncrement, exportRulesToJson, exportSingleRuleToJson, importRulesFromJson, ImportValidationError, toggleRule, generateId, getDefaultRuleMappings, setDefaultRuleForUrl, removeDefaultRuleForUrl, getRule } from '@/storage/rules';
import { Routes, Route, useRoute, useNavigate } from '@/lib/hash-router';
import { Button, Card } from '@/components';
import RuleForm from './components/RuleForm';
import RuleList from './components/RuleList';
import SyntaxHelp from './components/SyntaxHelp';
import ArchivedRulesSidebar from './components/ArchivedRulesSidebar';
import FabConfig from './components/FabConfig';
import ImageStorageConfig from './components/ImageStorageConfig';

function OptionsContent() {
  const navigate = useNavigate();
  const { route } = useRoute();
  const [rules, setRules] = useState<FillRule[]>([]);
  const [archivedRules, setArchivedRules] = useState<FillRule[]>([]);
  const [editingRule, setEditingRule] = useState<FillRule | null>(null);
  const [loadingRule, setLoadingRule] = useState(false);
  const [showSyntaxHelp, setShowSyntaxHelp] = useState(false);
  const [isArchivedSidebarOpen, setIsArchivedSidebarOpen] = useState(false);
  const [defaultMappings, setDefaultMappings] = useState<DefaultRuleMapping[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadRules();
    loadDefaultMappings();
  }, []);

  async function loadRules() {
    const activeRules = await getActiveRules();
    const archived = await getArchivedRules();
    setRules(activeRules);
    setArchivedRules(archived);
  }

  async function loadDefaultMappings() {
    const mappings = await getDefaultRuleMappings();
    setDefaultMappings(mappings);
  }

  const loadRuleForEdit = useCallback(async (ruleId: string) => {
    setLoadingRule(true);
    try {
      const rule = await getRule(ruleId);
      if (rule) {
        setEditingRule({ ...rule });
      } else {
        // Rule not found, redirect to list
        navigate('');
      }
    } catch (error) {
      console.error('Failed to load rule:', error);
      navigate('');
    } finally {
      setLoadingRule(false);
    }
  }, [navigate]);

  // Load rule when route changes to edit/{ruleId}
  useEffect(() => {
    if (route.view === 'edit') {
      loadRuleForEdit(route.ruleId);
    } else if (route.view === 'create') {
      setEditingRule(createEmptyRule());
    } else {
      setEditingRule(null);
    }
  }, [route, loadRuleForEdit]);

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
    navigate('create');
  }

  function handleEdit(rule: FillRule) {
    navigate(`edit/${rule.id}`);
    if (isArchivedSidebarOpen) {
      setIsArchivedSidebarOpen(false);
    }
  }

  async function handleSave(rule: FillRule) {
    const isCreating = route.view === 'create';
    if (isCreating) {
      await addRule(rule);
    } else {
      await updateRule(rule);
    }
    await loadRules();
    navigate('');
  }

  function handleCancel() {
    navigate('');
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

        <Route
          path="image-storage"
          element={<ImageStorageConfig onBack={() => navigate('')} />}
        />
        <Route
          path="action-button"
          element={<FabConfig onBack={() => navigate('')} />}
        />
        <Route
          path="create"
          element={
            editingRule ? (
              <RuleForm
                rule={editingRule}
                onSave={handleSave}
                onCancel={handleCancel}
                isNew={true}
                isHelpOpen={showSyntaxHelp}
                isArchivedSidebarOpen={isArchivedSidebarOpen}
                onArchive={handleArchive}
                onRestore={handleRestore}
                onPermanentDelete={handlePermanentDelete}
              />
            ) : null
          }
        />
        <Route
          path="edit/:ruleId"
          element={
            loadingRule ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : editingRule ? (
              <RuleForm
                rule={editingRule}
                onSave={handleSave}
                onCancel={handleCancel}
                isNew={false}
                isHelpOpen={showSyntaxHelp}
                isArchivedSidebarOpen={isArchivedSidebarOpen}
                onArchive={handleArchive}
                onRestore={handleRestore}
                onPermanentDelete={handlePermanentDelete}
              />
            ) : null
          }
        />
        <Route
          path=""
          element={
            <>
              <div className="flex flex-wrap gap-2 items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-zinc-200">Rules</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="secondary" onClick={() => navigate('action-button')}>
                    <Zap className="w-4 h-4" />
                    Action Button
                  </Button>
                  <Button variant="secondary" onClick={() => navigate('image-storage')}>
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
                  onEdit={handleEdit}
                  onArchive={handleArchive}
                  onResetIncrement={handleResetIncrement}
                  onDuplicate={handleDuplicate}
                  onToggle={handleToggle}
                  onExport={handleExportSingle}
                  defaultMappings={defaultMappings}
                  onSetDefault={handleSetDefault}
                  onRemoveDefault={handleRemoveDefault}
                />
              )}
            </>
          }
        />
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

export default function Options() {
  return (
    <Routes>
      <OptionsContent />
    </Routes>
  );
}
