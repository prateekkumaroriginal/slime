import { useEffect, useState } from 'react';
import type { FillRule } from '@/shared/types';
import { getRules, addRule, updateRule, deleteRule, createEmptyRule, resetIncrement } from '@/storage/rules';
import RuleForm from './components/RuleForm';
import RuleList from './components/RuleList';

export default function Options() {
  const [rules, setRules] = useState<FillRule[]>([]);
  const [editingRule, setEditingRule] = useState<FillRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Rule
              </button>
            </div>

            {rules.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900 rounded-xl border border-zinc-800">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-zinc-300 mb-2">No rules yet</h3>
                <p className="text-zinc-500 mb-4">Create your first rule to start auto-filling forms</p>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
                >
                  Create Rule
                </button>
              </div>
            ) : (
              <RuleList
                rules={rules}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onResetIncrement={handleResetIncrement}
              />
            )}

            <SyntaxHelp />
          </>
        )}
      </div>
    </div>
  );
}

function SyntaxHelp() {
  return (
    <div className="mt-10 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
      <h3 className="text-lg font-semibold text-zinc-200 mb-4">Template Syntax Reference</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-3">
          <SyntaxItem syntax="{{inc}}" description="Auto-increment number" example="1, 2, 3..." />
          <SyntaxItem syntax="{{inc:100}}" description="Increment starting from value" example="100, 101, 102..." />
          <SyntaxItem syntax="{{random:5}}" description="Random string of length" example="xK9pL" />
        </div>
        <div className="space-y-3">
          <SyntaxItem syntax="{{pick:a,b,c}}" description="Random pick from list" example="b" />
          <SyntaxItem syntax="{{date:YYYY-MM-DD}}" description="Current date" example="2025-12-27" />
          <SyntaxItem syntax={'{{regex:[A-Z]{2}\\d{3}}}'} description="Generate from regex" example="AB123" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-zinc-800">
        <p className="text-zinc-400 text-sm">
          <span className="text-emerald-400 font-medium">Hybrid example:</span>{' '}
          <code className="px-2 py-0.5 bg-zinc-800 rounded text-zinc-300">
            {'user_{{inc}}@{{pick:gmail,yahoo}}.com'}
          </code>{' '}
          → user_1@gmail.com
        </p>
      </div>
    </div>
  );
}

function SyntaxItem({ syntax, description, example }: { syntax: string; description: string; example: string }) {
  return (
    <div className="flex items-start gap-3">
      <code className="px-2 py-0.5 bg-zinc-800 rounded text-emerald-400 text-xs font-mono shrink-0">{syntax}</code>
      <div>
        <p className="text-zinc-300">{description}</p>
        <p className="text-zinc-500 text-xs">→ {example}</p>
      </div>
    </div>
  );
}

