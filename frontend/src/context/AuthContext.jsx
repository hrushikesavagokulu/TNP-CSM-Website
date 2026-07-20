import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true while checking initial auth state

  // ── Rehydrate on page refresh via /student/profile/me ────────────────────
  useEffect(() => {
    // Call getMe directly via Axios to avoid dependency imports
    import('../services/api').then(({ default: api }) => {
      api.get('/student/profile/me')
        .then((res) => setUser(res.data.data))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4 text-[var(--color-text-secondary)]">
          <div className="w-12 h-12 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin" />
          <p className="text-sm font-semibold tracking-wide animate-pulse">Initialising session...</p>
        </div>
      </div>
    );
  }

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
