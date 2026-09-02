import { api } from './client';

const qs = (params = {}) => {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));
  const str = new URLSearchParams(clean).toString();
  return str ? `?${str}` : '';
};

export const getWorkers = (params) => api.get(`/admin/workers${qs(params)}`);
export const getWorkerDetail = (id) => api.get(`/admin/workers/${id}`);
export const createWorker = (payload) => api.post('/admin/workers', payload);
export const updateWorker = (id, payload) => api.patch(`/admin/workers/${id}`, payload);
export const deactivateWorker = (id) => api.delete(`/admin/workers/${id}`);
