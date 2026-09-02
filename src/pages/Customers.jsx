import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { TableSkeleton, EmptyState, ErrorState } from '../components/States';
import { getCustomers } from '../api/misc';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    getCustomers({ search: search || undefined, limit: 50 })
      .then((d) => setCustomers(d.customers || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <AppLayout title="Customers">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="flex items-center gap-2 bg-white border border-cloud-200 rounded-pill px-3.5 py-2.5 sm:w-72 mb-4 focus-within:border-brand-400 transition-colors"
      >
        <Search size={16} className="text-ink-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or mobile"
          className="bg-transparent outline-none text-sm w-full placeholder:text-ink-500"
        />
      </form>

      <div className="bg-white rounded-card border border-cloud-200 shadow-soft overflow-hidden">
        {error && <ErrorState message={error} onRetry={load} />}
        {!error && loading && <TableSkeleton rows={8} cols={5} />}
        {!error && !loading && customers.length === 0 && (
          <EmptyState icon={Users} title="No customers found" description="Try a different search term." />
        )}

        {!error && !loading && customers.length > 0 && (
          <>
            <table className="w-full hidden md:table">
              <thead>
                <tr className="text-left text-xs text-ink-500 border-b border-cloud-200">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Mobile</th>
                  <th className="px-5 py-3 font-medium">Requests</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud-100">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-cloud-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link to={`/customers/${c._id}`} className="text-sm font-medium text-ink-900 hover:text-brand-600">
                        {c.name || 'Unnamed'}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-ink-700">{c.mobile}</td>
                    <td className="px-5 py-3.5 text-sm tabular">{c.requestCount}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-pill ${
                          c.isBlocked ? 'bg-rose-50 text-rose-500' : 'bg-mint-50 text-mint-600'
                        }`}
                      >
                        {c.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-ink-500 tabular">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="md:hidden divide-y divide-cloud-100">
              {customers.map((c) => (
                <Link key={c._id} to={`/customers/${c._id}`} className="block px-4 py-3.5 hover:bg-cloud-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{c.name || 'Unnamed'}</p>
                    <span
                      className={`text-[11px] font-semibold px-2 py-1 rounded-pill ${
                        c.isBlocked ? 'bg-rose-50 text-rose-500' : 'bg-mint-50 text-mint-600'
                      }`}
                    >
                      {c.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </div>
                  <p className="text-xs text-ink-500 mt-1">
                    {c.mobile} · {c.requestCount} requests
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
