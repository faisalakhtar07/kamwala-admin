import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { adminLogin } from '../api/auth';
import { getToken, setToken, clearToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // We don't have a "get current admin" endpoint wired up here, so on
    // reload we trust a stored token exists and let the first API call
    // fail-and-redirect (via client.js clearToken on 401) if it's stale.
    const token = getToken();
    const cachedAdmin = localStorage.getItem('kamwala_admin_profile');
    if (token && cachedAdmin) {
      try {
        setAdmin(JSON.parse(cachedAdmin));
      } catch {
        clearToken();
      }
    }
    setInitializing(false);
  }, []);

  const login = useCallback(async (mobile, password) => {
    const data = await adminLogin(mobile, password);
    setToken(data.token);
    localStorage.setItem('kamwala_admin_profile', JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem('kamwala_admin_profile');
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, initializing, login, logout, isAuthed: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
