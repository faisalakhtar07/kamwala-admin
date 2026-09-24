import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { adminLogin } from '../api/auth';
import { getToken, setToken, clearToken } from '../api/client';
import { enablePushNotifications, disablePushNotifications } from '../utils/push';

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
        // Silently (re)register this device for real push notifications -
        // e.g. after a page reload with an already-logged-in session.
        enablePushNotifications();
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
    enablePushNotifications();
    return data;
  }, []);

  const logout = useCallback(() => {
    disablePushNotifications();
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
