import { api } from './client';

const qs = (params = {}) => {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));
  const str = new URLSearchParams(clean).toString();
  return str ? `?${str}` : '';
};

// Customers
export const getCustomers = (params) => api.get(`/admin/customers${qs(params)}`);
export const getCustomerDetail = (id) => api.get(`/admin/customers/${id}`);
export const setCustomerBlockStatus = (id, isBlocked, reason) =>
  api.patch(`/admin/customers/${id}/block`, { isBlocked, reason });

// Reviews
export const getReviews = (params) => api.get(`/admin/reviews${qs(params)}`);
export const moderateReview = (id, payload) => api.patch(`/admin/reviews/${id}/moderate`, payload);

// Support
export const getTickets = (params) => api.get(`/admin/support/tickets${qs(params)}`);
export const respondToTicket = (id, payload) => api.patch(`/admin/support/tickets/${id}`, payload);

// Notifications
export const getNotifications = (params) => api.get(`/admin/notifications${qs(params)}`);
export const markNotificationRead = (id) => api.patch(`/admin/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/admin/notifications/read-all');

// Categories (public GET, admin-protected create/update)
export const getCategories = () => api.get('/categories');
export const createCategory = (payload) => api.post('/admin/categories', payload);
export const updateCategory = (id, payload) => api.patch(`/admin/categories/${id}`, payload);

// Chat (shared with customer app, scoped to a request)
export const getChatMessages = (requestId) => api.get(`/chat/${requestId}`);
export const sendChatMessage = (requestId, message) => api.post(`/chat/${requestId}`, { message });

// Worker applications ("Become a Worker" submissions from the customer app)
export const getWorkerApplications = (params) => api.get(`/admin/worker-applications${qs(params)}`);
export const getWorkerApplicationDetail = (id) => api.get(`/admin/worker-applications/${id}`);
export const reviewWorkerApplication = (id, payload) =>
  api.patch(`/admin/worker-applications/${id}`, payload);

// Services (pricing & discounts under each category)
export const getAllServices = (params) => api.get(`/admin/services${qs(params)}`);
export const createService = (payload) => api.post('/admin/services', payload);
export const updateService = (id, payload) => api.patch(`/admin/services/${id}`, payload);
export const deactivateService = (id) => api.delete(`/admin/services/${id}`);
