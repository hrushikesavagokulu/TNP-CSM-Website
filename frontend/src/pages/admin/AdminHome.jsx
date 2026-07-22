import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import overviewService from '../../services/admin/overview.service';

// Quick-link tiles configuration
const ADMIN_TILES = [
  { key: 'students', label: 'Total Students', icon: '👥', path: '/admin/students', linkLabel: 'Manage Students', trend: '▲ +12%' },
  { key: 'admins', label: 'Admin Accounts', icon: '🛡️', path: '/admin/admins', linkLabel: 'Manage Admins', trend: '● Active' },
  { key: 'announcements', label: 'Announcements', icon: '🔔', path: '/admin/announcements', linkLabel: 'Manage Notices', trend: '▲ Active' },
  { key: 'achievements', label: 'Achievements', icon: '🌟', path: '/admin/achievements', linkLabel: 'Manage Awards', trend: '▲ Verified' },
  { key: 'companies', label: 'Company Profiles', icon: '🏢', path: '/admin/companies', linkLabel: 'Manage Drives', trend: '▲ +4 New' },
];

function StatCard({ tile, value, loading }) {
  return (
    <Link
      to={tile.path}
      id={`admin-stat-${tile.key}`}
      className="glass-card p-5 flex flex-col justify-between gap-3 hover:-translate-y-0.5 hover:border-[var(--color-danger)] transition-all no-underline group"
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{tile.icon}</span>
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--color-success)] bg-[var(--color-success-bg)] px-2 py-0.5 rounded border border-[var(--color-success)]/30">
          {tile.trend}
        </span>
      </div>
      <div>
        {loading ? (
          <div className="h-8 w-20 bg-[var(--color-bg-secondary)] animate-pulse rounded-lg" />
        ) : (
          <p className="font-mono text-2xl font-extrabold text-[var(--color-text-primary)]">{value ?? '—'}</p>
        )}
        <p className="font-display text-xs font-bold text-[var(--color-text-secondary)] mt-1">{tile.label}</p>
      </div>
      <span className="font-mono text-[10px] font-bold text-[var(--color-danger)] opacity-80 group-hover:opacity-100 transition-opacity">
        {tile.linkLabel} →
      </span>
    </Link>
  );
}

export default function AdminHome() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    overviewService.getStats()
      .then((data) => { if (!cancelled) setStats(data); })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.message || 'Failed to load stats.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-fade-in font-sans">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-danger)] animate-pulse" />
          <span className="font-mono text-xs font-bold text-[var(--color-danger)] uppercase tracking-widest">Administrator Control Room</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">Admin Overview & Platform Management</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">CSM Department · G. Pulla Reddy Engineering College</p>
      </div>

      {error && (
        <div className="glass-card p-4 border border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] text-xs text-[var(--color-danger)]">
          ⚠️ {error}
        </div>
      )}

      {/* 1. Stat Tiles Grid */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
          Real-time System Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {ADMIN_TILES.map((tile) => (
            <StatCard
              key={tile.key}
              tile={tile}
              value={stats?.counts?.[tile.key]}
              loading={loading}
            />
          ))}
        </div>
      </div>

      {/* 2. Quick Management Modules Grid */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
          Management Controls
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Post Announcement', icon: '📢', path: '/admin/announcements' },
            { label: 'Add Company Drive', icon: '🏢', path: '/admin/companies' },
            { label: 'Post Achievement', icon: '🌟', path: '/admin/achievements' },
            { label: 'Manage Roster', icon: '👥', path: '/admin/students' },
            { label: 'Skill Roadmap', icon: '🗺️', path: '/admin/skill-roadmap' },
            { label: 'Department Info', icon: '🏛️', path: '/admin/department-info' },
            { label: 'Alumni Repository', icon: '🎓', path: '/admin/alumni-repos' },
            { label: 'Connect Sphere', icon: '💬', path: '/admin/connect-sphere' },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.path}
              id={`admin-quick-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="glass-card p-4 flex items-center gap-3 border border-[var(--color-border)] hover:border-[var(--color-danger)] transition-all hover:-translate-y-0.5 no-underline group"
            >
              <span className="text-xl flex-shrink-0">{action.icon}</span>
              <span className="font-display text-xs font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-danger)] transition-colors">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Connect Sphere Activity Monitor */}
      <div className="glass-card p-5 border border-[var(--color-border)] flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] flex items-center justify-center text-xl flex-shrink-0">
            💬
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)]">
              Connect Sphere Chat Room Pulse (24h)
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {loading ? 'Fetching activity...' : `${stats?.counts?.recentMessages24h || 0} active messages exchanged in the past 24 hours.`}
            </p>
          </div>
        </div>
        <Link to="/admin/connect-sphere" className="btn-primary text-xs flex-shrink-0">
          Moderate Rooms →
        </Link>
      </div>
    </div>
  );
}
