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
          className="flex items-center gap-3 text-[var(--color-text-primary)] no-underline group"
        >
          <img
            src="https://www.gprec.ac.in/wp-content/uploads/2019/05/gprec_logo1.png"
            alt="GPREC Logo"
            className="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105 filter drop-shadow-sm"
          />
          <div className="flex flex-col justify-center leading-tight">
            <span className="font-extrabold text-base tracking-tight text-[var(--color-text-primary)]">
              T&P <span className="text-red-500 font-black">· CSM</span>
            </span>
            <span className="text-[9px] font-bold text-[var(--color-text-muted)] tracking-wider uppercase hidden sm:block">
              G. Pulla Reddy Engg. College
            </span>
          </div>
        </Link>

        {/* ── Right side ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link
                  to="/admin"
                  id="navbar-admin-panel-btn"
                  className="px-4 py-2 text-sm font-semibold rounded-lg
                    text-red-500 hover:bg-red-500/10 transition-all duration-150"
                >
                  Admin Panel
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  id="navbar-dashboard-btn"
                  className="px-4 py-2 text-sm font-medium rounded-lg
                    text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
                    hover:bg-[var(--color-accent-subtle)] transition-all duration-150"
                >
                  Dashboard
                </Link>
              )}
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
              <Link
                to="/admin/login"
                id="navbar-admin-login-btn"
                className="ml-2 px-3 py-1.5 text-xs font-bold rounded-lg border border-red-500/40
                  text-red-500 hover:bg-red-500/10 transition-all duration-150 hover:-translate-y-px"
              >
                🛡️ Admin
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
