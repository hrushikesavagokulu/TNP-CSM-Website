import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const navigate          = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email.trim() || !password) {
      setError('Please fill in both email and password.');
      setLoading(false);
      return;
    }

    try {
      const user = await login(email.trim().toLowerCase(), password);
      
      // Verify role is admin
      if (user.role !== 'admin') {
        // Logout immediately and show access warning
        await logout();
        setError('These credentials do not belong to an admin account — use the student login instead');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[var(--color-bg)] font-sans">
      <div className="glass-card max-w-sm w-full p-8 border-t-4 border-red-500 flex flex-col gap-6">
        
        {/* Header Title */}
        <div className="text-center">
          <span className="text-3xl">🛡️</span>
          <h1 className="text-xl font-black text-[var(--color-text-primary)] mt-3">Admin Portal</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Sign in to access administrator dashboard console</p>
        </div>

        {/* Errors Alert */}
        {error && (
          <div className="px-3 py-2 rounded-lg bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-xs text-[var(--color-error)]">
            ⚠ {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">Email Address</label>
            <input
              id="admin-login-email"
              type="email"
              placeholder="admin@gprec.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">Password</label>
            <input
              id="admin-login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs focus:outline-none"
            />
          </div>

          <button id="admin-login-submit" type="submit" disabled={loading} className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl mt-2 flex items-center justify-center gap-2">
            {loading ? 'Signing in...' : 'Sign In as Admin'}
          </button>
        </form>

        {/* Password recovery Link */}
        <div className="text-center pt-2">
          <Link to="/forgot-password" className="text-xs text-[var(--color-accent)] hover:underline font-semibold">
            Forgot Password?
          </Link>
        </div>

      </div>
    </div>
  );
}
