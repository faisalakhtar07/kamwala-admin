import { useEffect, useState } from 'react';
import { LifeBuoy } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { TableSkeleton, EmptyState, ErrorState } from '../components/States';
import { Select, Textarea, Button } from '../components/Form';
import { getTickets, respondToTicket } from '../api/misc';
import { useToast } from '../context/ToastContext';

const STATUS_STYLE = {
  open: 'bg-brand-50 text-brand-700',
  in_progress: 'bg-amber-50 text-amber-500',
  resolved: 'bg-mint-50 text-mint-600',
  closed: 'bg-cloud-100 text-ink-500',
};

export default function Support() {
  const { push } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replies, setReplies] = useState({});

  const load = () => {
    setLoading(true);
    setError('');
    getTickets({})
      .then(setTickets)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleReply = async (ticket, status) => {
    try {
      await respondToTicket(ticket._id, { status, adminReply: replies[ticket._id] });
      push('Ticket updated.', 'success');
      load();
    } catch (err) {
      push(err.message || 'Could not update ticket.', 'error');
    }
  };

  return (
    <AppLayout title="Support tickets">
      <div className="bg-white rounded-card border border-cloud-200 shadow-soft overflow-hidden">
        {error && <ErrorState message={error} onRetry={load} />}
        {!error && loading && <TableSkeleton rows={5} cols={3} />}
        {!error && !loading && tickets.length === 0 && (
          <EmptyState icon={LifeBuoy} title="No support tickets" description="Customer issues will show up here." />
        )}

        <div className="divide-y divide-cloud-100">
          {tickets.map((t) => (
            <div key={t._id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold">{t.subject}</p>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {t.customerId?.name} · {t.customerId?.mobile} · {t.category.replace(/_/g, ' ')}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-pill ${STATUS_STYLE[t.status]}`}>
                  {t.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-sm text-ink-700 mt-2 bg-cloud-50 rounded-lg p-2.5">{t.message}</p>

              <div className="mt-3 flex items-end gap-2 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Textarea
                    rows={2}
                    placeholder="Write a reply…"
                    value={replies[t._id] ?? t.adminReply ?? ''}
                    onChange={(e) => setReplies((r) => ({ ...r, [t._id]: e.target.value }))}
                  />
                </div>
                <Select
                  className="w-auto"
                  defaultValue={t.status}
                  onChange={(e) => handleReply(t, e.target.value)}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </Select>
                <Button size="sm" onClick={() => handleReply(t, t.status)}>
                  Send reply
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
