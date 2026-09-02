import { api } from './client';

export const adminLogin = (mobile, password) =>
  api.post('/auth/admin/login', { mobile, password }, { auth: false });
