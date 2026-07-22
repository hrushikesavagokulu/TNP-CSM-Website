import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../shared/ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      id="main-navbar"
      className={`sticky top-0 z-50 w-full transition-all duration-200 backdrop-blur-md ${
        isScrolled
          ? 'bg-[var(--color-surface)]/85 border-b border-[var(--color-border)] shadow-sm'
          : 'bg-[var(--color-surface)]/85 border-b border-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* ── Left Group: Logo & Brand Wordmark ────────────────────────────── */}
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
            <span className="font-display font-bold text-base tracking-tight text-[var(--color-text-primary)] signature-underline group-hover:after:scale-x-100">
              T&P <span className="text-[var(--color-accent)] font-extrabold">· CSM</span>
            </span>
            <span className="text-[9px] font-mono text-[var(--color-text-muted)] tracking-wider uppercase hidden sm:block">
              G. Pulla Reddy Engg. College
            </span>
          </div>
        </Link>

        {/* ── Right Group: Compact Utility Controls ───────────────────────── */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link
                  to="/admin"
                  id="navbar-admin-panel-btn"
                  className="h-9 px-3 text-sm font-semibold rounded-lg bg-[var(--color-danger-bg)]
                    text-[var(--color-danger)] border border-[var(--color-danger)]/20 hover:bg-[var(--color-danger)]/20 transition-all duration-150 flex items-center gap-1.5"
                >
                  🛡️ Admin Panel
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  id="navbar-dashboard-btn"
                  className="h-9 px-3 text-sm font-medium rounded-lg
                    text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
                    hover:bg-[var(--color-accent-subtle)] transition-all duration-150 flex items-center"
                >
                  Dashboard
                </Link>
              )}
              <button
                id="navbar-logout-btn"
                onClick={handleLogout}
                className="h-9 px-3 text-sm font-medium rounded-lg
                  text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]
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
                className="h-9 px-3 text-sm font-medium rounded-lg
                  text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
                  hover:bg-[var(--color-accent-subtle)] transition-all duration-150 flex items-center"
              >
                Login
              </Link>
              <Link
                to="/register"
                id="navbar-register-btn"
                className="h-9 px-3.5 text-sm font-semibold rounded-lg
                  bg-[var(--color-accent)] text-[var(--color-text-inverse)]
                  hover:bg-[var(--color-accent-hover)]
                  transition-all duration-150 hover:-translate-y-px flex items-center"
              >
                Register
              </Link>
              <Link
                to="/admin/login"
                id="navbar-admin-login-btn"
                className="h-9 px-3 text-xs font-bold rounded-lg border border-[var(--color-danger)]/40
                  text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-all duration-150 flex items-center gap-1"
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
