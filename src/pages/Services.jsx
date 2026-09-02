import { useEffect, useState } from 'react';
import { Plus, Tag, Clock } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { TableSkeleton, EmptyState, ErrorState } from '../components/States';
import { Button, Input, Textarea, Select } from '../components/Form';
import { Modal } from '../components/Modal';
import { getCategories, getAllServices, createService, updateService, deactivateService } from '../api/misc';
import { useToast } from '../context/ToastContext';

const emptyForm = {
  categoryId: '',
  name: '',
  description: '',
  price: '',
  discountPercent: '',
  estimatedTime: '',
};

export default function Services() {
  const { push } = useToast();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const load = () => {
    setLoading(true);
    setError('');
    getAllServices(selectedCategory ? { category: selectedCategory } : {})
      .then(setServices)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [selectedCategory]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, categoryId: selectedCategory || categories[0]?._id || '' });
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      categoryId: s.categoryId?._id || s.categoryId,
      name: s.name,
      description: s.description || '',
      price: s.price,
      discountPercent: s.discountPercent || '',
      estimatedTime: s.estimatedTime || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryId || !form.name || form.price === '') {
      push('Category, name and price are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        categoryId: form.categoryId,
        name: form.name,
        description: form.description,
        price: Number(form.price),
        discountPercent: Number(form.discountPercent) || 0,
        estimatedTime: form.estimatedTime,
      };
      if (editing) {
        await updateService(editing._id, payload);
        push('Service updated.', 'success');
      } else {
        await createService(payload);
        push('Service added.', 'success');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      push(err.message || 'Could not save service.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (s) => {
    try {
      if (s.active) {
        await deactivateService(s._id);
      } else {
        await updateService(s._id, { active: true });
      }
      load();
    } catch (err) {
      push(err.message || 'Could not update service.', 'error');
    }
  };

  return (
    <AppLayout title="Services & Pricing">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="sm:w-64"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Button className="sm:ml-auto" onClick={openAdd}>
          <Plus size={16} /> Add service
        </Button>
      </div>

      <div className="bg-white rounded-card border border-cloud-200 shadow-soft overflow-hidden">
        {error && <ErrorState message={error} onRetry={load} />}
        {!error && loading && <TableSkeleton rows={6} cols={4} />}
        {!error && !loading && services.length === 0 && (
          <EmptyState
            icon={Tag}
            title="No services yet"
            description="Add priced services so customers can book them directly with clear pricing."
            action={<Button onClick={openAdd}>Add service</Button>}
          />
        )}

        {!error && !loading && services.length > 0 && (
          <div className="divide-y divide-cloud-100">
            {services.map((s) => {
              const hasDiscount = s.discountPercent > 0;
              return (
                <button
                  key={s._id}
                  onClick={() => openEdit(s)}
                  className={`w-full text-left px-5 py-4 hover:bg-cloud-50 transition-colors flex items-center justify-between gap-4 ${
                    !s.active ? 'opacity-50' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{s.name}</p>
                      <span className="text-xs text-ink-500">{s.categoryId?.name}</span>
                      {!s.active && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-pill bg-cloud-100 text-ink-500">
                          Hidden
                        </span>
                      )}
                    </div>
                    {s.description && <p className="text-xs text-ink-500 mt-1">{s.description}</p>}
                    {s.estimatedTime && (
                      <p className="text-xs text-ink-500 mt-1 flex items-center gap-1">
                        <Clock size={11} /> {s.estimatedTime}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-baseline gap-2 justify-end">
                      <span className="font-display font-bold text-base text-brand-600">₹{s.finalPrice}</span>
                      {hasDiscount && <span className="text-xs text-ink-500 line-through">₹{s.price}</span>}
                    </div>
                    {hasDiscount && (
                      <span className="text-[11px] font-bold text-rose-500">{s.discountPercent}% OFF</span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleActive(s);
                      }}
                      className="block text-[11px] font-semibold text-brand-600 mt-1"
                    >
                      {s.active ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit service' : 'Add service'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving…' : 'Save service'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Select
            label="Category"
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Input
            label="Service name"
            placeholder="e.g. Tap replacement"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Textarea
            label="Description (optional)"
            rows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price (₹)"
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
            <Input
              label="Discount (%)"
              type="number"
              min="0"
              max="100"
              value={form.discountPercent}
              onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
            />
          </div>
          <Input
            label="Estimated time (optional)"
            placeholder="e.g. 30-45 mins"
            value={form.estimatedTime}
            onChange={(e) => setForm((f) => ({ ...f, estimatedTime: e.target.value }))}
          />
        </form>
      </Modal>
    </AppLayout>
  );
}
