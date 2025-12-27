import { useEffect, useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import type { FillRule } from '@/shared/types';
import { getRules, addRule, updateRule, deleteRule, createEmptyRule, resetIncrement } from '@/storage/rules';
import { Button, Card } from '@/components';
import RuleForm from './components/RuleForm';
import RuleList from './components/RuleList';
import SyntaxHelp from './components/SyntaxHelp';

export default function Options() {
  const [rules, setRules] = useState<FillRule[]>([]);
  const [editingRule, setEditingRule] = useState<FillRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showSyntaxHelp, setShowSyntaxHelp] = useState(false);

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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-400 mb-2">Form Filler</h1>
          <p className="text-zinc-400">Manage your form filling rules and field mappings</p>
        </header>

        {editingRule ? (
          <RuleForm rule={editingRule} onSave={handleSave} onCancel={handleCancel} isNew={isCreating} />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-zinc-200">Rules</h2>
              <Button onClick={handleCreate}>
                <Plus className="w-5 h-5" />
                New Rule
              </Button>
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
              />
            )}
          </>
        )}
      </div>

      <SyntaxHelp isOpen={showSyntaxHelp} onToggle={() => setShowSyntaxHelp(!showSyntaxHelp)} />
    </div>
  );
}
