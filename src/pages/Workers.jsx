import { useEffect, useState } from 'react';
import { Plus, Phone, Star, HardHat } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { TableSkeleton, EmptyState, ErrorState } from '../components/States';
import { Button, Input, Select, Textarea } from '../components/Form';
import { Modal } from '../components/Modal';
import { getWorkers, createWorker, updateWorker } from '../api/workers';
import { useToast } from '../context/ToastContext';

const AVAILABILITY_STYLE = {
  available: 'bg-mint-50 text-mint-600',
  busy: 'bg-amber-50 text-amber-500',
  offline: 'bg-cloud-100 text-ink-500',
};

const emptyForm = {
  name: '',
  mobile: '',
  services: '',
  categories: '',
  experienceYears: '',
  serviceArea: '',
  address: '',
  notes: '',
  availability: 'available',
};

export default function Workers() {
  const { push } = useToast();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    getWorkers({ search: search || undefined, limit: 50 })
      .then((d) => setWorkers(d.workers || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (w) => {
    setEditing(w);
    setForm({
      name: w.name,
      mobile: w.mobile,
      services: (w.services || []).join(', '),
      categories: (w.categories || []).join(', '),
      experienceYears: w.experienceYears || '',
      serviceArea: (w.serviceArea || []).join(', '),
      address: w.address || '',
      notes: w.notes || '',
      availability: w.availability,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.services) {
      push('Name, mobile and at least one service are required.', 'error');
      return;
    }

    const payload = {
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      services: form.services.split(',').map((s) => s.trim()).filter(Boolean),
      categories: form.categories.split(',').map((s) => s.trim()).filter(Boolean),
      serviceArea: form.serviceArea.split(',').map((s) => s.trim()).filter(Boolean),
      experienceYears: Number(form.experienceYears) || 0,
      address: form.address,
      notes: form.notes,
      availability: form.availability,
    };

    setSaving(true);
    try {
      if (editing) {
        await updateWorker(editing._id, payload);
        push('Worker updated.', 'success');
      } else {
        await createWorker(payload);
        push('Worker added.', 'success');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      push(err.message || 'Could not save worker.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Workers">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
          className="flex items-center gap-2 bg-white border border-cloud-200 rounded-pill px-3.5 py-2.5 sm:w-72 focus-within:border-brand-400 transition-colors"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search worker name"
            className="bg-transparent outline-none text-sm w-full placeholder:text-ink-500"
          />
        </form>
        <Button className="sm:ml-auto" onClick={openAdd}>
          <Plus size={16} /> Add worker
        </Button>
      </div>

      <div className="bg-white rounded-card border border-cloud-200 shadow-soft overflow-hidden">
        {error && <ErrorState message={error} onRetry={load} />}
        {!error && loading && <TableSkeleton rows={6} cols={4} />}
        {!error && !loading && workers.length === 0 && (
          <EmptyState
            icon={HardHat}
            title="No workers yet"
            description="Add your first service professional to start assigning requests."
            action={<Button onClick={openAdd}>Add worker</Button>}
          />
        )}

        {!error && !loading && workers.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {workers.map((w) => (
              <button
                key={w._id}
                onClick={() => openEdit(w)}
                className="text-left rounded-card border border-cloud-200 p-4 hover:border-brand-300 hover:bg-cloud-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-sm font-semibold">
                      {w.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{w.name}</p>
                      <p className="text-xs text-ink-500">{w.services?.[0]}</p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-1 rounded-pill ${AVAILABILITY_STYLE[w.availability]}`}>
                    {w.availability}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-ink-500">
                  <span>{w.experienceYears} yrs exp.</span>
                  <span className="flex items-center gap-1">
                    <Star size={12} className="fill-amber-500 text-amber-500" />
                    {w.rating?.average?.toFixed(1) || 'New'}
                  </span>
                  <a href={`tel:${w.mobile}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-brand-600 font-medium">
                    <Phone size={12} /> Call
                  </a>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit worker' : 'Add worker'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving…' : 'Save worker'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input
              label="Mobile number"
              value={form.mobile}
              maxLength={10}
              onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value.replace(/\D/g, '') }))}
            />
          </div>
          <Input
            label="Services (comma separated)"
            placeholder="Wiring, Fan installation, Switch repair"
            value={form.services}
            onChange={(e) => setForm((f) => ({ ...f, services: e.target.value }))}
          />
          <Input
            label="Categories (comma separated)"
            placeholder="Home Services"
            value={form.categories}
            onChange={(e) => setForm((f) => ({ ...f, categories: e.target.value }))}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              label="Experience (years)"
              type="number"
              value={form.experienceYears}
              onChange={(e) => setForm((f) => ({ ...f, experienceYears: e.target.value }))}
            />
            <Select label="Availability" value={form.availability} onChange={(e) => setForm((f) => ({ ...f, availability: e.target.value }))}>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </Select>
          </div>
          <Input
            label="Service area (comma separated cities/localities)"
            placeholder="Aurangabad"
            value={form.serviceArea}
            onChange={(e) => setForm((f) => ({ ...f, serviceArea: e.target.value }))}
          />
          <Input label="Address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          <Textarea
            label="Internal notes (admin only)"
            rows={2}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </form>
      </Modal>
    </AppLayout>
  );
}
