import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import overviewService from '../../services/admin/overview.service';

// Quick-link tiles configuration
const ADMIN_TILES = [
  {
    key: 'students',
    label: 'Total Students',
    icon: '👥',
    color: 'from-blue-500 to-cyan-500',
    textColor: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    path: '/admin/students',
    linkLabel: 'Manage Students',
  },
  {
    key: 'admins',
    label: 'Admin Accounts',
    icon: '🛡️',
    color: 'from-purple-500 to-violet-600',
    textColor: 'text-purple-400',
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/5',
    path: '/admin/admins',
    linkLabel: 'Manage Admins',
  },
  {
    key: 'announcements',
    label: 'Announcements',
    icon: '🔔',
    color: 'from-amber-500 to-orange-500',
    textColor: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/5',
    path: '/admin/announcements',
    linkLabel: 'Manage Announcements',
  },
  {
    key: 'achievements',
    label: 'Achievements',
    icon: '🌟',
    color: 'from-yellow-400 to-amber-500',
    textColor: 'text-yellow-400',
    border: 'border-yellow-500/20',
    bg: 'bg-yellow-500/5',
    path: '/admin/achievements',
    linkLabel: 'Manage Achievements',
  },
  {
    key: 'companies',
    label: 'Company Profiles',
    icon: '🏢',
    color: 'from-emerald-500 to-teal-500',
    textColor: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    path: '/admin/companies',
    linkLabel: 'Manage Companies',
  },
  {
    key: 'alumni',
    label: 'Alumni Entries',
    icon: '🎓',
    color: 'from-sky-500 to-blue-500',
    textColor: 'text-sky-400',
    border: 'border-sky-500/20',
    bg: 'bg-sky-500/5',
    path: '/admin/alumni-repos',
    linkLabel: 'Manage Alumni',
  },
  {
    key: 'skillSemesters',
    label: 'Skill Semesters',
    icon: '🗺️',
    color: 'from-pink-500 to-rose-500',
    textColor: 'text-pink-400',
    border: 'border-pink-500/20',
    bg: 'bg-pink-500/5',
    path: '/admin/skill-roadmap',
    linkLabel: 'Manage Roadmap',
  },
  {
    key: 'certifications',
    label: 'Certifications',
    icon: '🏅',
    color: 'from-indigo-500 to-purple-500',
    textColor: 'text-indigo-400',
    border: 'border-indigo-500/20',
    bg: 'bg-indigo-500/5',
    path: '/admin/certifications',
    linkLabel: 'Manage Certifications',
  },
  {
    key: 'chatSpaces',
    label: 'Chat Spaces',
    icon: '💬',
    color: 'from-teal-500 to-cyan-500',
    textColor: 'text-teal-400',
    border: 'border-teal-500/20',
    bg: 'bg-teal-500/5',
    path: '/admin/connect-sphere',
    linkLabel: 'Manage Spaces',
  },
  {
    key: 'recentMessages24h',
    label: 'Messages (24h)',
    icon: '📨',
    color: 'from-rose-500 to-pink-600',
    textColor: 'text-rose-400',
    border: 'border-rose-500/20',
    bg: 'bg-rose-500/5',
    path: '/admin/connect-sphere',
    linkLabel: 'View Connect Sphere',
  },
];

function StatCard({ tile, value, loading }) {
  return (
    <Link
      to={tile.path}
      id={`admin-stat-${tile.key}`}
      className={`glass-card p-5 flex flex-col gap-3 border ${tile.border} ${tile.bg} hover:-translate-y-1 hover:shadow-xl transition-all duration-200 no-underline group`}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{tile.icon}</span>
        <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border ${tile.border} ${tile.textColor} opacity-70`}>
          Live
        </span>
      </div>
      <div>
        {loading ? (
          <div className="h-8 w-20 bg-[var(--color-bg-secondary)] animate-pulse rounded-lg" />
        ) : (
          <p className={`text-3xl font-black ${tile.textColor}`}>{value ?? '—'}</p>
        )}
        <p className="text-xs text-[var(--color-text-secondary)] font-semibold mt-1">{tile.label}</p>
      </div>
      <span className={`text-[11px] font-bold ${tile.textColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
        {tile.linkLabel} →
      </span>
    </Link>
  );
}

function RecentList({ title, icon, items, loading, renderItem }) {
  return (
    <div className="glass-card p-5 flex flex-col gap-3 border border-[var(--color-border)]">
      <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-[var(--color-bg-secondary)] animate-pulse rounded-lg" />
          ))}
        </div>
      ) : items?.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)] italic text-center py-4">No entries yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items?.map(renderItem)}
        </div>
      )}
    </div>
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
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Admin Overview</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">CSM Placement & Training Management Portal · Real-time platform statistics</p>
      </div>

      {error && (
        <div className="glass-card p-4 border border-red-500/30 bg-red-500/5 text-sm text-red-400">
          ⚠️ {error}
        </div>
      )}

      {/* Stat Tiles Grid */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Platform Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Post Announcement', icon: '📢', path: '/admin/announcements', color: 'border-amber-500/30 hover:border-amber-500/50 text-amber-400' },
            { label: 'Add Company Profile', icon: '🏢', path: '/admin/companies', color: 'border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400' },
            { label: 'Post Achievement', icon: '🌟', path: '/admin/achievements', color: 'border-yellow-500/30 hover:border-yellow-500/50 text-yellow-400' },
            { label: 'Manage Students', icon: '👥', path: '/admin/students', color: 'border-blue-500/30 hover:border-blue-500/50 text-blue-400' },
            { label: 'Skill Roadmap', icon: '🗺️', path: '/admin/skill-roadmap', color: 'border-pink-500/30 hover:border-pink-500/50 text-pink-400' },
            { label: 'Department Info', icon: '🏛️', path: '/admin/department-info', color: 'border-purple-500/30 hover:border-purple-500/50 text-purple-400' },
            { label: 'Alumni Repository', icon: '🎓', path: '/admin/alumni-repos', color: 'border-sky-500/30 hover:border-sky-500/50 text-sky-400' },
            { label: 'Connect Sphere', icon: '💬', path: '/admin/connect-sphere', color: 'border-teal-500/30 hover:border-teal-500/50 text-teal-400' },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.path}
              id={`admin-quick-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={`glass-card p-4 flex items-center gap-3 border ${action.color} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md no-underline`}
            >
              <span className="text-xl">{action.icon}</span>
              <span className={`text-xs font-bold ${action.color.split(' ').find((c) => c.startsWith('text-'))}`}>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentList
          title="Recent Achievements"
          icon="🌟"
          items={stats?.recent?.achievements}
          loading={loading}
          renderItem={(item) => (
            <div key={item._id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[var(--color-bg-secondary)]">
              <span className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{item.title}</span>
              <span className="text-[10px] text-[var(--color-text-muted)] flex-shrink-0">
                {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          )}
        />
        <RecentList
          title="Recent Announcements"
          icon="🔔"
          items={stats?.recent?.announcements}
          loading={loading}
          renderItem={(item) => (
            <div key={item._id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[var(--color-bg-secondary)]">
              <span className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{item.title}</span>
              <span className="text-[10px] text-[var(--color-text-muted)] flex-shrink-0">
                {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </span>
            </div>
          )}
        />
      </div>

      {/* Connect Sphere Activity Pulse */}
      <div className={`glass-card p-4 border ${stats?.counts?.recentMessages24h > 0 ? 'border-teal-500/20 bg-teal-500/5' : 'border-[var(--color-border)]'} flex items-center gap-4`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${stats?.counts?.recentMessages24h > 0 ? 'bg-teal-500/20' : 'bg-[var(--color-bg-secondary)]'}`}>
          💬
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-[var(--color-text-primary)]">
            Connect Sphere Activity (Last 24h)
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {loading ? '...' : (
              stats?.counts?.recentMessages24h > 0
                ? `${stats.counts.recentMessages24h} message${stats.counts.recentMessages24h !== 1 ? 's' : ''} sent across all spaces in the past 24 hours.`
                : 'No chat activity in the last 24 hours.'
            )}
          </p>
        </div>
        <Link to="/admin/connect-sphere" className="text-xs font-bold text-teal-400 hover:underline flex-shrink-0 no-underline">
          Moderate →
        </Link>
      </div>
    </div>
  );
}
