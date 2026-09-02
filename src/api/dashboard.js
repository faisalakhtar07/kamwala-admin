import { api } from './client';

export const getDashboardStats = () => api.get('/admin/dashboard');
