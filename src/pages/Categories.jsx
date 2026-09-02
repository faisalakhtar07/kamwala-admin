import { useEffect, useState } from 'react';
import { Plus, Grid3x3 } from 'lucide-react';
import * as Icons from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { TableSkeleton, EmptyState, ErrorState } from '../components/States';
import { Button, Input, Textarea } from '../components/Form';
import { Modal } from '../components/Modal';
import { getCategories, createCategory, updateCategory } from '../api/misc';
import { useToast } from '../context/ToastContext';

const emptyForm = { name: '', description: '', icon: 'Wrench' };

export default function Categories() {
  const { push } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    getCategories()
      .then(setCategories)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || '', icon: c.icon || 'Wrench' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      push('Category name is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing._id, form);
        push('Category updated.', 'success');
      } else {
        await createCategory(form);
        push('Category added.', 'success');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      push(err.message || 'Could not save category.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c) => {
    try {
      await updateCategory(c._id, { active: !c.active });
      load();
    } catch (err) {
      push(err.message || 'Could not update category.', 'error');
    }
  };

  return (
    <AppLayout title="Categories">
      <div className="flex justify-end mb-4">
        <Button onClick={openAdd}>
          <Plus size={16} /> Add category
        </Button>
      </div>

      <div className="bg-white rounded-card border border-cloud-200 shadow-soft overflow-hidden">
        {error && <ErrorState message={error} onRetry={load} />}
        {!error && loading && <TableSkeleton rows={6} cols={3} />}
        {!error && !loading && categories.length === 0 && (
          <EmptyState icon={Grid3x3} title="No categories yet" description="Add the work categories customers can request." action={<Button onClick={openAdd}>Add category</Button>} />
        )}

        {!error && !loading && categories.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {categories.map((c) => {
              const Icon = Icons[c.icon] || Icons.Wrench;
              return (
                <button
                  key={c._id}
                  onClick={() => openEdit(c)}
                  className={`text-left rounded-card border p-4 transition-colors ${
                    c.active ? 'border-cloud-200 hover:border-brand-300 hover:bg-cloud-50' : 'border-cloud-200 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-9 w-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Icon size={17} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{c.name}</p>
                      <p className="text-xs text-ink-500">{c.active ? 'Active' : 'Hidden'}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleActive(c);
                    }}
                    className="text-xs font-semibold text-brand-600 mt-3"
                  >
                    {c.active ? 'Hide from customers' : 'Show to customers'}
                  </button>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit category' : 'Add category'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving…' : 'Save category'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input
            label="Icon (lucide-react name, e.g. Wrench, PaintRoller)"
            value={form.icon}
            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
          />
          <Textarea
            label="Description (optional)"
            rows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </form>
      </Modal>
    </AppLayout>
  );
}
