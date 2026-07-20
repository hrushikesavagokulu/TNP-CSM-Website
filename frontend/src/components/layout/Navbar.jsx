import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../shared/ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-50 w-full border-b border-[var(--color-border)]"
      style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)' }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* ── Logo / Wordmark ──────────────────────────────────────────────── */}
        <Link
          to="/"
          id="navbar-logo"
          className="flex items-center gap-2.5 text-[var(--color-text-primary)] no-underline group"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center
                          transition-transform duration-200 group-hover:scale-105">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="font-semibold text-base hidden sm:block">
            TMP <span className="text-[var(--color-text-muted)] font-normal">· CSM</span>
          </span>
        </Link>

        {/* ── Right side ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <>
              <Link
                to="/dashboard"
                id="navbar-dashboard-btn"
                className="px-4 py-2 text-sm font-medium rounded-lg
                  text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
                  hover:bg-[var(--color-accent-subtle)] transition-all duration-150"
              >
                Dashboard
              </Link>
              <button
                id="navbar-logout-btn"
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium rounded-lg
                  text-[var(--color-error)] hover:bg-[var(--color-error-bg)]
                  transition-all duration-150"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                id="navbar-login-btn"
                className="px-4 py-2 text-sm font-medium rounded-lg
                  text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
                  hover:bg-[var(--color-accent-subtle)] transition-all duration-150"
              >
                Login
              </Link>
              <Link
                to="/register"
                id="navbar-register-btn"
                className="px-4 py-2 text-sm font-semibold rounded-lg
                  bg-[var(--color-accent)] text-white
                  hover:bg-[var(--color-accent-hover)]
                  transition-all duration-150 hover:-translate-y-px"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
