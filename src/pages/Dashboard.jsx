import { useEffect, useState } from 'react';
import { Users, Inbox, Clock, Wrench, IndianRupee, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import DashboardCard from '../components/DashboardCard';
import { CardSkeleton, ErrorState } from '../components/States';
import { getDashboardStats } from '../api/dashboard';
import { getRequests } from '../api/requests';
import { StatusPill, RequestIdTag } from '../components/StatusPill';

const inr = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([getDashboardStats(), getRequests({ limit: 5 })])
      .then(([s, r]) => {
        setStats(s);
        setRecent(r.requests || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <AppLayout title="Dashboard">
      {error && <ErrorState message={error} onRetry={load} />}

      {!error && loading && <CardSkeleton count={6} />}

      {!error && !loading && stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <DashboardCard label="Total customers" value={stats.totalCustomers} icon={Users} accent="brand" />
            <DashboardCard label="New requests" value={stats.newRequests} icon={Inbox} accent="amber" />
            <DashboardCard label="Pending" value={stats.pending} icon={Clock} accent="amber" />
            <DashboardCard label="In progress" value={stats.inProgress} icon={Wrench} accent="brand" />
            <DashboardCard label="Completed" value={stats.completedTotal} icon={TrendingUp} accent="mint" />
            <DashboardCard label="Today's revenue" value={inr(stats.todayRevenue)} icon={IndianRupee} accent="mint" />
          </div>

          <div className="mt-4 bg-white rounded-card border border-cloud-200 p-5 shadow-soft flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-500 font-medium">This month's revenue</p>
              <p className="font-display font-bold text-3xl tabular mt-1">{inr(stats.monthRevenue)}</p>
            </div>
            <Link to="/requests" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              View all requests →
            </Link>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-base">Latest requests</h2>
              <Link to="/requests" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                See all
              </Link>
            </div>

            <div className="bg-white rounded-card border border-cloud-200 shadow-soft divide-y divide-cloud-100">
              {recent.length === 0 && (
                <p className="text-sm text-ink-500 p-5">No requests yet.</p>
              )}
              {recent.map((r) => (
                <Link
                  key={r._id}
                  to={`/requests/${r.requestId}`}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-cloud-50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <RequestIdTag id={r.requestId} size="sm" />
                      <p className="text-sm font-medium truncate">{r.service}</p>
                    </div>
                    <p className="text-xs text-ink-500 mt-1">
                      {r.customerId?.name || 'Customer'} · {r.address?.city}
                    </p>
                  </div>
                  <StatusPill status={r.status} />
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
