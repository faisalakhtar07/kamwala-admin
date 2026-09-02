import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, MapPin, Calendar, ArrowLeft, IndianRupee, Users, Send } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { ErrorState } from '../components/States';
import { StatusPill, RequestIdTag } from '../components/StatusPill';
import { Button, Select, Input } from '../components/Form';
import AssignWorkerPanel from '../components/AssignWorkerPanel';
import { getRequestDetail, updateRequestStatus, updateRequestPricing } from '../api/requests';
import { getChatMessages, sendChatMessage } from '../api/misc';
import { useToast } from '../context/ToastContext';

const STATUS_FLOW = [
  'new',
  'under_review',
  'contacted',
  'worker_being_arranged',
  'price_pending',
  'awaiting_customer_confirmation',
  'assigned',
  'worker_on_the_way',
  'in_progress',
  'completed',
];

export default function RequestDetail() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [pricing, setPricing] = useState({ finalPrice: '', workerPayment: '' });
  const [savingPricing, setSavingPricing] = useState(false);

  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef(null);

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([getRequestDetail(requestId), getChatMessages(requestId)])
      .then(([r, msgs]) => {
        setRequest(r);
        setPricing({ finalPrice: r.finalPrice || '', workerPayment: r.workerPayment || '' });
        setMessages(msgs);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [requestId]);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || sendingChat) return;
    setSendingChat(true);
    setChatInput('');
    try {
      const msg = await sendChatMessage(requestId, text);
      setMessages((m) => [...m, msg]);
    } catch (err) {
      push(err.message || 'Message could not be sent.', 'error');
    } finally {
      setSendingChat(false);
    }
  };

  const handleStatusChange = async (e) => {
    const status = e.target.value;
    setSavingStatus(true);
    try {
      await updateRequestStatus(requestId, status);
      push('Status updated.', 'success');
      load();
    } catch (err) {
      push(err.message || 'Could not update status.', 'error');
    } finally {
      setSavingStatus(false);
    }
  };

  const handlePricingSave = async () => {
    setSavingPricing(true);
    try {
      await updateRequestPricing(requestId, {
        finalPrice: Number(pricing.finalPrice) || undefined,
        workerPayment: Number(pricing.workerPayment) || undefined,
        paymentStatus: 'paid',
      });
      push('Pricing saved.', 'success');
      load();
    } catch (err) {
      push(err.message || 'Could not save pricing.', 'error');
    } finally {
      setSavingPricing(false);
    }
  };

  if (error) {
    return (
      <AppLayout title="Request">
        <ErrorState message={error} onRetry={load} />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Request detail">
      <button
        onClick={() => navigate('/requests')}
        className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-4"
      >
        <ArrowLeft size={15} /> Back to requests
      </button>

      {loading && <div className="h-64 rounded-card bg-cloud-100 animate-pulse" />}

      {!loading && request && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {/* Header card */}
            <div className="bg-white rounded-card border border-cloud-200 p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <RequestIdTag id={request.requestId} />
                  <h2 className="font-display font-bold text-xl mt-2">{request.service}</h2>
                  <p className="text-sm text-ink-500">{request.serviceCategory}</p>
                </div>
                <StatusPill status={request.status} />
              </div>

              {request.description && (
                <p className="text-sm text-ink-700 mt-4 bg-cloud-50 rounded-lg p-3">{request.description}</p>
              )}

              <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
                <div className="flex items-start gap-2 text-ink-700">
                  <MapPin size={16} className="text-ink-500 mt-0.5 shrink-0" />
                  <span>
                    {request.address?.fullAddress}, {request.address?.city} - {request.address?.pincode}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-ink-700">
                  <Calendar size={16} className="text-ink-500 mt-0.5 shrink-0" />
                  <span>
                    {request.preferredDate ? new Date(request.preferredDate).toLocaleDateString('en-IN') : 'Not specified'}
                    {request.preferredTime ? ` · ${request.preferredTime}` : ''}
                  </span>
                </div>
                {request.workerCount > 1 && (
                  <div className="flex items-center gap-2 text-ink-700">
                    <Users size={16} className="text-ink-500 shrink-0" />
                    <span>{request.workerCount} workers · {request.durationDays} day{request.durationDays > 1 ? 's' : ''}</span>
                  </div>
                )}
                {request.budget && !request.finalPrice && (
                  <div className="flex items-center gap-2 text-ink-700">
                    <IndianRupee size={16} className="text-ink-500 shrink-0" />
                    <span>Customer's budget: ₹{request.budget}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status timeline */}
            <div className="bg-white rounded-card border border-cloud-200 p-5 shadow-soft">
              <h3 className="font-display font-semibold text-sm mb-4">Status timeline</h3>
              <ol className="space-y-0">
                {STATUS_FLOW.map((s, i) => {
                  const reached = STATUS_FLOW.indexOf(request.status) >= i || request.status === 'completed';
                  const isCurrent = request.status === s;
                  return (
                    <li key={s} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={`h-3 w-3 rounded-full shrink-0 ${
                            reached ? 'bg-brand-500' : 'bg-cloud-200'
                          } ${isCurrent ? 'ring-4 ring-brand-100' : ''}`}
                        />
                        {i < STATUS_FLOW.length - 1 && (
                          <span className={`w-px flex-1 ${reached ? 'bg-brand-200' : 'bg-cloud-200'}`} style={{ minHeight: 24 }} />
                        )}
                      </div>
                      <p className={`text-sm pb-6 ${reached ? 'text-ink-900 font-medium' : 'text-ink-500'}`}>
                        {s.replace(/_/g, ' ')}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-card border border-cloud-200 p-5 shadow-soft">
              <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-1.5">
                <IndianRupee size={15} /> Pricing & revenue
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  label="Final price (₹)"
                  type="number"
                  value={pricing.finalPrice}
                  onChange={(e) => setPricing((p) => ({ ...p, finalPrice: e.target.value }))}
                />
                <Input
                  label="Worker payment (₹)"
                  type="number"
                  value={pricing.workerPayment}
                  onChange={(e) => setPricing((p) => ({ ...p, workerPayment: e.target.value }))}
                />
              </div>
              {request.platformEarning != null && (
                <p className="text-xs text-ink-500 mt-2">
                  Platform earning: <span className="font-semibold text-mint-600 tabular">₹{request.platformEarning}</span>
                </p>
              )}
              <Button size="sm" className="mt-3" onClick={handlePricingSave} disabled={savingPricing}>
                {savingPricing ? 'Saving…' : 'Save pricing'}
              </Button>
            </div>

            {/* Chat with customer */}
            <div className="bg-white rounded-card border border-cloud-200 shadow-soft flex flex-col h-[420px]">
              <div className="px-5 py-3.5 border-b border-cloud-200">
                <h3 className="font-display font-semibold text-sm">Chat with customer</h3>
                <p className="text-xs text-ink-500">Managed conversation — worker contact stays private.</p>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.length === 0 && (
                  <p className="text-sm text-ink-500 text-center mt-8">No messages yet.</p>
                )}
                {messages.map((m) => {
                  const isAdmin = m.senderRole === 'admin';
                  return (
                    <div key={m._id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] rounded-card px-4 py-2.5 text-sm leading-relaxed ${
                          isAdmin ? 'bg-brand-500 text-white rounded-tr-sm' : 'bg-cloud-50 text-ink-900 rounded-tl-sm'
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendChat} className="flex items-center gap-2 px-3 py-3 border-t border-cloud-200">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Reply to customer…"
                  className="flex-1 bg-cloud-50 border border-cloud-200 rounded-pill px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 transition-colors"
                />
                <button
                  type="submit"
                  disabled={sendingChat || !chatInput.trim()}
                  aria-label="Send"
                  className="h-9 w-9 rounded-full bg-brand-500 text-white flex items-center justify-center disabled:opacity-50 hover:bg-brand-600 transition-colors shrink-0"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-card border border-cloud-200 p-5 shadow-soft">
              <h3 className="font-display font-semibold text-sm mb-3">Customer</h3>
              <p className="text-sm font-medium">{request.customerId?.name}</p>
              <a
                href={`tel:${request.customerId?.mobile}`}
                className="flex items-center gap-1.5 text-sm text-brand-600 font-medium mt-1"
              >
                <Phone size={14} /> {request.customerId?.mobile}
              </a>
            </div>

            <div className="bg-white rounded-card border border-cloud-200 p-5 shadow-soft">
              <h3 className="font-display font-semibold text-sm mb-3">Assigned worker</h3>
              {request.assignedWorkerId ? (
                <div>
                  <p className="text-sm font-medium">{request.assignedWorkerId.name}</p>
                  <a
                    href={`tel:${request.assignedWorkerId.mobile}`}
                    className="flex items-center gap-1.5 text-sm text-brand-600 font-medium mt-1"
                  >
                    <Phone size={14} /> Call worker
                  </a>
                </div>
              ) : (
                <p className="text-sm text-ink-500">No worker assigned yet.</p>
              )}
              <Button size="sm" variant="outline" className="w-full mt-3" onClick={() => setAssignOpen(true)}>
                {request.assignedWorkerId ? 'Reassign worker' : 'Assign worker'}
              </Button>
            </div>

            <div className="bg-white rounded-card border border-cloud-200 p-5 shadow-soft">
              <h3 className="font-display font-semibold text-sm mb-3">Update status</h3>
              <Select value={request.status} onChange={handleStatusChange} disabled={savingStatus}>
                {[...STATUS_FLOW, 'cancelled'].map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      )}

      <AssignWorkerPanel
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        request={request}
        onAssigned={load}
      />
    </AppLayout>
  );
}
