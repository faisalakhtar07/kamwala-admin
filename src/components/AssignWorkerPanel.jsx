import { useEffect, useState } from 'react';
import { Phone, Star, CheckCircle2 } from 'lucide-react';
import { SlideOver } from './Modal';
import { Button } from './Form';
import { getWorkers } from '../api/workers';
import { assignWorkerToRequest } from '../api/requests';
import { useToast } from '../context/ToastContext';

export default function AssignWorkerPanel({ open, onClose, request, onAssigned }) {
  const { push } = useToast();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!open || !request) return;
    setLoading(true);
    setSelected(null);
    getWorkers({ service: request.service, city: request.address?.city })
      .then((d) => setWorkers(d.workers || []))
      .catch(() => setWorkers([]))
      .finally(() => setLoading(false));
  }, [open, request]);

  const handleAssign = async () => {
    if (!selected) return;
    setAssigning(true);
    try {
      await assignWorkerToRequest(request.requestId, selected._id);
      push(`${selected.name} assigned to ${request.requestId}.`, 'success');
      onAssigned?.();
      onClose();
    } catch (err) {
      push(err.message || 'Could not assign worker.', 'error');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title="Assign a worker"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" disabled={!selected || assigning} onClick={handleAssign}>
            {assigning ? 'Assigning…' : 'Assign worker'}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-ink-500 mb-4">
        Matching workers for <span className="font-semibold text-ink-900">{request?.service}</span> in{' '}
        {request?.address?.city}.
      </p>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-card bg-cloud-100 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && workers.length === 0 && (
        <p className="text-sm text-ink-500 py-8 text-center">No matching workers found in the database.</p>
      )}

      <div className="space-y-2">
        {workers.map((w) => {
          const isSelected = selected?._id === w._id;
          return (
            <button
              key={w._id}
              onClick={() => setSelected(w)}
              className={`w-full text-left rounded-card border p-3.5 transition-colors ${
                isSelected ? 'border-brand-500 bg-brand-50' : 'border-cloud-200 hover:bg-cloud-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-mint-100 text-mint-600 flex items-center justify-center text-sm font-semibold">
                    {w.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{w.name}</p>
                    <p className="text-xs text-ink-500">{w.services?.[0]}</p>
                  </div>
                </div>
                {isSelected && <CheckCircle2 size={18} className="text-brand-500" />}
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      w.availability === 'available' ? 'bg-mint-500' : 'bg-ink-300'
                    }`}
                  />
                  {w.availability === 'available' ? 'Available' : w.availability}
                </span>
                <span className="flex items-center gap-1 text-xs text-ink-500">
                  <Star size={12} className="fill-amber-500 text-amber-500" />
                  {w.rating?.average?.toFixed(1) || 'New'}
                </span>
                <a
                  href={`tel:${w.mobile}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-xs font-medium text-brand-600"
                >
                  <Phone size={12} /> Call
                </a>
              </div>
            </button>
          );
        })}
      </div>
    </SlideOver>
  );
}
