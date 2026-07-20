import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true while checking initial auth state

  // ── Rehydrate on page refresh via /auth/me ──────────────────────────────
  useEffect(() => {
    authService.getMe()
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // ── Auth actions ─────────────────────────────────────────────────────────
  const register = useCallback(async (payload) => {
    return authService.register(payload);
  }, []);

  const verifyOtp = useCallback(async (email, otp) => {
    const data = await authService.verifyOtp(email, otp);
    setUser(data.user || data);
    return data;
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user || data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    await authService.refreshToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, register, verifyOtp, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
