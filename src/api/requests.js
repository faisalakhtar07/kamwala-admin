import { api } from './client';

const qs = (params = {}) => {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));
  const str = new URLSearchParams(clean).toString();
  return str ? `?${str}` : '';
};

export const getRequests = (params) => api.get(`/admin/requests${qs(params)}`);
export const getRequestDetail = (requestId) => api.get(`/admin/requests/${requestId}`);
export const updateRequestStatus = (requestId, status, note) =>
  api.patch(`/admin/requests/${requestId}/status`, { status, note });
export const assignWorkerToRequest = (requestId, workerId) =>
  api.patch(`/admin/requests/${requestId}/assign-worker`, { workerId });
export const updateRequestPricing = (requestId, payload) =>
  api.patch(`/admin/requests/${requestId}/pricing`, payload);
