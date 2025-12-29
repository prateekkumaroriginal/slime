import { useEffect, useState, useRef } from 'react';
import { Plus, FileText, Download, Upload } from 'lucide-react';
import type { FillRule } from '@/shared/types';
import { getRules, addRule, updateRule, deleteRule, createEmptyRule, resetIncrement, exportRulesToJson, importRulesFromJson, ImportValidationError, toggleRule, generateId } from '@/storage/rules';
import { Button, Card } from '@/components';
import RuleForm from './components/RuleForm';
import RuleList from './components/RuleList';
import SyntaxHelp from './components/SyntaxHelp';

export default function Options() {
  const [rules, setRules] = useState<FillRule[]>([]);
  const [editingRule, setEditingRule] = useState<FillRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showSyntaxHelp, setShowSyntaxHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    const loadedRules = await getRules();
    setRules(loadedRules);
  }

  function handleCreate() {
    setEditingRule(createEmptyRule());
    setIsCreating(true);
  }

  function handleEdit(rule: FillRule) {
    setEditingRule({ ...rule });
    setIsCreating(false);
  }

  async function handleSave(rule: FillRule) {
    if (isCreating) {
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

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this rule?')) {
      await deleteRule(id);
      await loadRules();
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
      <div className="max-w-4xl mx-auto px-6 py-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-400 mb-2">Slime</h1>
          <p className="text-zinc-400">Manage your form filling rules and field mappings</p>
        </header>

        {editingRule ? (
          <RuleForm rule={editingRule} onSave={handleSave} onCancel={handleCancel} isNew={isCreating} />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-zinc-200">Rules</h2>
              <div className="flex items-center gap-2">
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
                onDelete={handleDelete}
                onResetIncrement={handleResetIncrement}
                onDuplicate={handleDuplicate}
                onToggle={handleToggle}
              />
            )}
          </>
        )}
      </div>

      <SyntaxHelp isOpen={showSyntaxHelp} onToggle={() => setShowSyntaxHelp(!showSyntaxHelp)} />
    </div>
  );
}
