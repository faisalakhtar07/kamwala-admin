import { useEffect, useState } from 'react';
import { HardHat, Phone, MapPin, Briefcase } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { TableSkeleton, EmptyState, ErrorState } from '../components/States';
import { Button, Textarea } from '../components/Form';
import { getWorkerApplications, reviewWorkerApplication } from '../api/misc';
import { useToast } from '../context/ToastContext';

const TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_STYLE = {
  pending: 'bg-amber-50 text-amber-500',
  approved: 'bg-mint-50 text-mint-600',
  rejected: 'bg-rose-50 text-rose-500',
};

export default function WorkerApplications() {
  const { push } = useToast();
  const [status, setStatus] = useState('pending');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState({});
  const [reviewing, setReviewing] = useState(null);

  const load = () => {
    setLoading(true);
    setError('');
    getWorkerApplications({ status })
      .then(setApplications)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status]);

  const handleReview = async (app, decision) => {
    setReviewing(app._id);
    try {
      await reviewWorkerApplication(app._id, {
        status: decision,
        adminNotes: notes[app._id] || '',
      });
      push(
        decision === 'approved'
          ? `${app.name} approved and added to the worker roster.`
          : `${app.name}'s application was rejected.`,
        'success'
      );
      load();
    } catch (err) {
      push(err.message || 'Could not review this application.', 'error');
    } finally {
      setReviewing(null);
    }
  };

  return (
    <AppLayout title="Worker Applications">
      <div className="flex gap-1.5 mb-4">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setStatus(t.value)}
            className={`rounded-pill px-3.5 py-2 text-sm font-medium transition-colors ${
              status === t.value ? 'bg-brand-500 text-white' : 'bg-white border border-cloud-200 text-ink-700 hover:bg-cloud-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-card border border-cloud-200 shadow-soft overflow-hidden">
        {error && <ErrorState message={error} onRetry={load} />}
        {!error && loading && <TableSkeleton rows={5} cols={3} />}
        {!error && !loading && applications.length === 0 && (
          <EmptyState
            icon={HardHat}
            title={`No ${status} applications`}
            description="Worker sign-ups from the customer app will show up here."
          />
        )}

        <div className="divide-y divide-cloud-100">
          {applications.map((app) => (
            <div key={app._id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold">{app.name}</p>
                  <a href={`tel:${app.mobile}`} className="flex items-center gap-1.5 text-xs text-brand-600 font-medium mt-0.5">
                    <Phone size={12} /> {app.mobile}
                  </a>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-pill ${STATUS_STYLE[app.status]}`}>
                  {app.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm text-ink-700">
                <span className="flex items-center gap-1.5">
                  <Briefcase size={13} className="text-ink-500" /> {app.categories?.join(', ') || '—'}
                </span>
                {app.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-ink-500" /> {app.city}
                  </span>
                )}
                <span className="text-ink-500">{app.experienceYears || 0} yrs experience</span>
              </div>

              {app.services?.length > 0 && (
                <p className="text-xs text-ink-500 mt-2">Skills: {app.services.join(', ')}</p>
              )}
              {app.address && <p className="text-xs text-ink-500 mt-1">{app.address}</p>}

              {app.status === 'pending' && (
                <div className="mt-3 flex items-end gap-2 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <Textarea
                      rows={1}
                      placeholder="Notes (optional)"
                      value={notes[app._id] || ''}
                      onChange={(e) => setNotes((n) => ({ ...n, [app._id]: e.target.value }))}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={reviewing === app._id}
                    onClick={() => handleReview(app, 'rejected')}
                  >
                    Reject
                  </Button>
                  <Button size="sm" disabled={reviewing === app._id} onClick={() => handleReview(app, 'approved')}>
                    {reviewing === app._id ? 'Saving…' : 'Approve'}
                  </Button>
                </div>
              )}

              {app.status === 'approved' && app.adminNotes && (
                <p className="text-xs text-mint-600 mt-2">Note: {app.adminNotes}</p>
              )}
              {app.status === 'rejected' && app.adminNotes && (
                <p className="text-xs text-rose-500 mt-2">Reason: {app.adminNotes}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
