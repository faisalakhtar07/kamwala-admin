import { useEffect, useState } from 'react';
import { Star, EyeOff, Eye } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { TableSkeleton, EmptyState, ErrorState } from '../components/States';
import { getReviews, moderateReview } from '../api/misc';
import { useToast } from '../context/ToastContext';
import { RequestIdTag } from '../components/StatusPill';

export default function Reviews() {
  const { push } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    getReviews({})
      .then(setReviews)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleVisibility = async (r) => {
    try {
      await moderateReview(r._id, { isVisible: !r.isVisible });
      push(r.isVisible ? 'Review hidden.' : 'Review made visible.', 'success');
      load();
    } catch (err) {
      push(err.message || 'Could not update review.', 'error');
    }
  };

  return (
    <AppLayout title="Reviews">
      <div className="bg-white rounded-card border border-cloud-200 shadow-soft overflow-hidden">
        {error && <ErrorState message={error} onRetry={load} />}
        {!error && loading && <TableSkeleton rows={5} cols={3} />}
        {!error && !loading && reviews.length === 0 && (
          <EmptyState icon={Star} title="No reviews yet" description="Reviews appear here once customers rate completed services." />
        )}

        <div className="divide-y divide-cloud-100">
          {reviews.map((r) => (
            <div key={r._id} className="px-5 py-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={i < r.rating ? 'fill-amber-500 text-amber-500' : 'text-cloud-200'} />
                  ))}
                  {r.requestId?.requestId && <RequestIdTag id={r.requestId.requestId} size="sm" />}
                </div>
                <p className="text-sm text-ink-700 mt-1.5">{r.comment}</p>
                <p className="text-xs text-ink-500 mt-1">{r.customerId?.name} · {new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <button
                onClick={() => toggleVisibility(r)}
                className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-900"
              >
                {r.isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                {r.isVisible ? 'Visible' : 'Hidden'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
