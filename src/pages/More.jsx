import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, LifeBuoy, Bell, ChevronRight, Grid3x3, Tag, UserPlus } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { TableSkeleton, EmptyState } from '../components/States';
import { getNotifications, markAllNotificationsRead } from '../api/misc';
import { Button } from '../components/Form';

export default function More() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getNotifications({})
      .then((d) => setNotifications(d.notifications || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <AppLayout title="More">
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <Link to="/categories" className="flex items-center gap-3 bg-white rounded-card border border-cloud-200 p-4 shadow-soft hover:bg-cloud-50 transition-colors">
          <span className="h-9 w-9 rounded-lg bg-mint-50 text-mint-600 flex items-center justify-center"><Grid3x3 size={17} /></span>
          <span className="font-medium text-sm flex-1">Categories</span>
          <ChevronRight size={16} className="text-ink-500" />
        </Link>
        <Link to="/services" className="flex items-center gap-3 bg-white rounded-card border border-cloud-200 p-4 shadow-soft hover:bg-cloud-50 transition-colors">
          <span className="h-9 w-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><Tag size={17} /></span>
          <span className="font-medium text-sm flex-1">Services & Pricing</span>
          <ChevronRight size={16} className="text-ink-500" />
        </Link>
        <Link to="/worker-applications" className="flex items-center gap-3 bg-white rounded-card border border-cloud-200 p-4 shadow-soft hover:bg-cloud-50 transition-colors">
          <span className="h-9 w-9 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center"><UserPlus size={17} /></span>
          <span className="font-medium text-sm flex-1">Worker Applications</span>
          <ChevronRight size={16} className="text-ink-500" />
        </Link>
        <Link to="/reviews" className="flex items-center gap-3 bg-white rounded-card border border-cloud-200 p-4 shadow-soft hover:bg-cloud-50 transition-colors">
          <span className="h-9 w-9 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center"><Star size={17} /></span>
          <span className="font-medium text-sm flex-1">Reviews</span>
          <ChevronRight size={16} className="text-ink-500" />
        </Link>
        <Link to="/support" className="flex items-center gap-3 bg-white rounded-card border border-cloud-200 p-4 shadow-soft hover:bg-cloud-50 transition-colors">
          <span className="h-9 w-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><LifeBuoy size={17} /></span>
          <span className="font-medium text-sm flex-1">Support tickets</span>
          <ChevronRight size={16} className="text-ink-500" />
        </Link>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold text-base flex items-center gap-2">
          <Bell size={17} /> Notifications
        </h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => markAllNotificationsRead().then(load)}
        >
          Mark all read
        </Button>
      </div>

      <div className="bg-white rounded-card border border-cloud-200 shadow-soft overflow-hidden">
        {loading && <TableSkeleton rows={4} cols={2} />}
        {!loading && notifications.length === 0 && (
          <EmptyState icon={Bell} title="No notifications" description="New requests and updates will appear here." />
        )}
        <div className="divide-y divide-cloud-100">
          {notifications.map((n) => (
            <div key={n._id} className={`px-5 py-3.5 ${!n.read ? 'bg-brand-50/40' : ''}`}>
              <p className="text-sm font-medium">{n.title}</p>
              <p className="text-xs text-ink-500 mt-0.5">{n.message}</p>
              <p className="text-[11px] text-ink-500 mt-1 tabular">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
