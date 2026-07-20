import { Routes, Route } from 'react-router-dom';

import { ThemeProvider }  from './context/ThemeContext';
import { AuthProvider }   from './context/AuthContext';
import Navbar            from './components/layout/Navbar';
import PublicRoute       from './routes/PublicRoute';

// ── Pages ─────────────────────────────────────────────────────────────────────
import Register      from './pages/public/Register';
import Login         from './pages/public/Login';
import ForgotPassword from './pages/public/ForgotPassword';

// ── Phase 0 health-check component (inline — will be replaced in Phase 4 Home page)
import { useEffect, useState } from 'react';
import api from './services/api';

function PlaceholderHome() {
  const [health,  setHealth]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    api.get('/health')
      .then((res) => setHealth(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-8 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">TMP Platform</h1>
        <p className="text-[var(--color-text-muted)]">Home page coming in Phase 4</p>
        <span className="inline-block mt-3 px-3 py-1 text-xs font-medium rounded-full
          bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent-border)]">
          Phase 1 · Auth & Theming
        </span>
      </div>

      <div className="w-full max-w-md glass-card p-6">
        <div className="flex items-center gap-2 mb-4 text-sm font-medium text-[var(--color-text-secondary)]">
          <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : error ? 'bg-red-400' : 'bg-emerald-400'}`} />
          Backend Health Check
        </div>
        {loading && <p className="text-sm text-[var(--color-text-muted)]">Pinging...</p>}
        {error   && <p className="text-sm text-[var(--color-error)]">{error}</p>}
        {health  && <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap">{JSON.stringify(health, null, 2)}</pre>}
      </div>
    </div>
  );
}

// ── Stub pages for routes not yet built ───────────────────────────────────────
function DashboardStub() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center glass-card p-10">
        <p className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Dashboard</p>
        <p className="text-[var(--color-text-muted)] text-sm">Coming in Phase 2 — Dashboard Shell</p>
      </div>
    </div>
  );
}

function AdminStub() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center glass-card p-10">
        <p className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Admin Panel</p>
        <p className="text-[var(--color-text-muted)] text-sm">Coming in a later phase</p>
      </div>
    </div>
  );
}

// ── App root ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-[var(--color-bg)] transition-colors duration-250">
          <Navbar />

          <main>
            <Routes>
              {/* Public home (placeholder until Phase 4) */}
              <Route path="/"              element={<PlaceholderHome />} />

              {/* Auth pages — redirect logged-in users away */}
              <Route path="/login"          element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register"       element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

              {/* Stub routes — will be replaced in later phases */}
              <Route path="/dashboard"      element={<DashboardStub />} />
              <Route path="/admin"          element={<AdminStub />} />

              {/* 404 */}
              <Route path="*" element={
                <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-6xl font-black text-[var(--color-text-muted)] mb-4">404</p>
                    <p className="text-[var(--color-text-secondary)]">Page not found</p>
                  </div>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
