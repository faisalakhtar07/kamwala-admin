import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { TableSkeleton, EmptyState, ErrorState } from '../components/States';
import { StatusPill, RequestIdTag } from '../components/StatusPill';
import { getRequests } from '../api/requests';
import { Inbox } from 'lucide-react';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'under_review', label: 'Under review' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    getRequests({ status, search: search || undefined, limit: 50 })
      .then((d) => setRequests(d.requests || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <AppLayout title="Requests">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <form onSubmit={onSearchSubmit} className="flex items-center gap-2 bg-white border border-cloud-200 rounded-pill px-3.5 py-2.5 sm:w-72 focus-within:border-brand-400 transition-colors">
          <Search size={16} className="text-ink-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search request ID"
            className="bg-transparent outline-none text-sm w-full placeholder:text-ink-500"
          />
        </form>

        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setStatus(t.value)}
              className={`whitespace-nowrap rounded-pill px-3.5 py-2 text-sm font-medium transition-colors ${
                status === t.value ? 'bg-brand-500 text-white' : 'bg-white border border-cloud-200 text-ink-700 hover:bg-cloud-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-card border border-cloud-200 shadow-soft overflow-hidden">
        {error && <ErrorState message={error} onRetry={load} />}
        {!error && loading && <TableSkeleton rows={8} cols={5} />}
        {!error && !loading && requests.length === 0 && (
          <EmptyState icon={Inbox} title="No requests found" description="Try a different filter or search term." />
        )}

        {!error && !loading && requests.length > 0 && (
          <>
            {/* Desktop table */}
            <table className="w-full hidden md:table">
              <thead>
                <tr className="text-left text-xs text-ink-500 border-b border-cloud-200">
                  <th className="px-5 py-3 font-medium">Request</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Service</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud-100">
                {requests.map((r) => (
                  <tr key={r._id} className="hover:bg-cloud-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link to={`/requests/${r.requestId}`}>
                        <RequestIdTag id={r.requestId} size="sm" />
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-sm">
                      <p className="font-medium">{r.customerId?.name || '—'}</p>
                      <p className="text-xs text-ink-500">{r.customerId?.mobile}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm">{r.service}</td>
                    <td className="px-5 py-3.5 text-sm text-ink-500">{r.address?.city}</td>
                    <td className="px-5 py-3.5"><StatusPill status={r.status} /></td>
                    <td className="px-5 py-3.5 text-xs text-ink-500 tabular">
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-cloud-100">
              {requests.map((r) => (
                <Link key={r._id} to={`/requests/${r.requestId}`} className="block px-4 py-3.5 hover:bg-cloud-50">
                  <div className="flex items-center justify-between gap-2">
                    <RequestIdTag id={r.requestId} size="sm" />
                    <StatusPill status={r.status} />
                  </div>
                  <p className="text-sm font-medium mt-2">{r.service}</p>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {r.customerId?.name || '—'} · {r.address?.city}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
