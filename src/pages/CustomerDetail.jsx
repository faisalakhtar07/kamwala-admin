import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Phone, ShieldOff, ShieldCheck } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { ErrorState } from '../components/States';
import { Button } from '../components/Form';
import { StatusPill, RequestIdTag } from '../components/StatusPill';
import { getCustomerDetail, setCustomerBlockStatus } from '../api/misc';
import { useToast } from '../context/ToastContext';

const inr = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    getCustomerDetail(id)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const toggleBlock = async () => {
    setToggling(true);
    try {
      await setCustomerBlockStatus(id, !data.customer.isBlocked, 'Updated by admin');
      push(data.customer.isBlocked ? 'Customer unblocked.' : 'Customer blocked.', 'success');
      load();
    } catch (err) {
      push(err.message || 'Could not update customer.', 'error');
    } finally {
      setToggling(false);
    }
  };

  return (
    <AppLayout title="Customer detail">
      <button onClick={() => navigate('/customers')} className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-4">
        <ArrowLeft size={15} /> Back to customers
      </button>

      {error && <ErrorState message={error} onRetry={load} />}
      {loading && <div className="h-48 rounded-card bg-cloud-100 animate-pulse" />}

      {!loading && data && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-card border border-cloud-200 p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-display font-bold">
                {(data.customer.name || 'U').charAt(0)}
              </div>
              <div>
                <p className="font-display font-semibold">{data.customer.name || 'Unnamed customer'}</p>
                <a href={`tel:${data.customer.mobile}`} className="flex items-center gap-1.5 text-sm text-brand-600 font-medium">
                  <Phone size={13} /> {data.customer.mobile}
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
              <div className="bg-cloud-50 rounded-lg p-2.5">
                <p className="text-ink-500 text-xs">Total spend</p>
                <p className="font-semibold tabular">{inr(data.totalSpend)}</p>
              </div>
              <div className="bg-cloud-50 rounded-lg p-2.5">
                <p className="text-ink-500 text-xs">Requests</p>
                <p className="font-semibold tabular">{data.requests.length}</p>
              </div>
            </div>

            <Button
              variant={data.customer.isBlocked ? 'secondary' : 'danger'}
              className="w-full mt-4"
              onClick={toggleBlock}
              disabled={toggling}
            >
              {data.customer.isBlocked ? <ShieldCheck size={16} /> : <ShieldOff size={16} />}
              {data.customer.isBlocked ? 'Unblock customer' : 'Block customer'}
            </Button>
          </div>

          <div className="lg:col-span-2 bg-white rounded-card border border-cloud-200 shadow-soft">
            <h3 className="font-display font-semibold text-sm px-5 pt-5">Service history</h3>
            <div className="divide-y divide-cloud-100 mt-3">
              {data.requests.length === 0 && <p className="text-sm text-ink-500 px-5 pb-5">No requests yet.</p>}
              {data.requests.map((r) => (
                <Link
                  key={r._id}
                  to={`/requests/${r.requestId}`}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-cloud-50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <RequestIdTag id={r.requestId} size="sm" />
                      <p className="text-sm font-medium">{r.service}</p>
                    </div>
                    <p className="text-xs text-ink-500 mt-1">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <StatusPill status={r.status} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
