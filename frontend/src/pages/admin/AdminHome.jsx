import { Link } from 'react-router-dom';

export default function AdminHome() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Admin Dashboard</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">CSM Placement & Training Management Portal</p>
      </div>

      {/* Main Announcement Box */}
      <div className="glass-card p-6 border-l-4 border-red-500 bg-red-500/5">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Admin Overview</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">
          Roster configuration and administration panel. Comprehensive analytics, placement rates, test activity metrics, and progress summaries will arrive in **Phase 11 (Reports & Analytics)**.
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-3">
          Currently, you can configure student nominal records, invite administrators, or modify student active details.
        </p>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
        {/* Manage Students */}
        <div className="glass-card p-6 flex flex-col justify-between gap-4 hover:shadow-md hover:border-red-500/30 transition-all duration-200">
          <div>
            <span className="text-3xl">👥</span>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] mt-3">Manage Student Roster</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
              Add single students, perform Excel bulk-imports of nominal rosters, edit student parameters (Year and Batch Types), or remove user records.
            </p>
          </div>
          <Link
            to="/admin/students"
            id="admin-home-students-btn"
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold text-xs rounded-lg text-center transition-all no-underline w-fit"
          >
            Open Student Manager
          </Link>
        </div>

        {/* Manage Admins */}
        <div className="glass-card p-6 flex flex-col justify-between gap-4 hover:shadow-md hover:border-red-500/30 transition-all duration-200">
          <div>
            <span className="text-3xl">🛡️</span>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] mt-3">Manage Admin Accounts</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
              Invite administrators by email, elevate registered users immediately, or revoke administrative access back to student status.
            </p>
          </div>
          <Link
            to="/admin/admins"
            id="admin-home-admins-btn"
            className="px-4 py-2 border border-red-500/50 text-red-500 hover:bg-red-500/10 font-semibold text-xs rounded-lg text-center transition-all no-underline w-fit"
          >
            Open Admin Manager
          </Link>
        </div>
      </div>
    </div>
  );
}
