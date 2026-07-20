import { useState, useEffect } from 'react';
import adminsService from '../../services/admin/admins.service';

export default function ManageAdmins() {
  const [activeAdmins,   setActiveAdmins]   = useState([]);
  const [pendingInvites,  setPendingInvites]  = useState([]);

  // Legacy Invite State
  const [emailInput, setEmailInput] = useState('');

  // New Create Admin State
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(null);

  const loadAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminsService.getAdmins();
      setActiveAdmins(data.activeAdmins || []);
      setPendingInvites(data.pendingInvites || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve administrators directories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  // ── Action: Legacy Allowlist Email Invite ──────────────────────────────────
  const handleAddInvite = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!emailInput.trim() || !emailInput.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      await adminsService.addAdminInvite(emailInput.trim().toLowerCase());
      setSuccess(`Email "${emailInput}" successfully allowlisted.`);
      setEmailInput('');
      loadAdmins();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add administrator invite.');
    }
  };

  // ── Action: Direct Admin Credentials Creation ──────────────────────────────
  const handleCreateCredentials = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { name, email, password, confirmPassword } = createForm;

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields for direct admin creation.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await adminsService.createAdminCredentials({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      setSuccess('Admin account created. Share these credentials with them directly — no email has been sent.');
      setCreateForm({ name: '', email: '', password: '', confirmPassword: '' });
      loadAdmins();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create administrator account.');
    }
  };

  // ── Action: Revoke Invite / Demote Admin ───────────────────────────────────
  const handleDeleteAdminOrInvite = async (id, nameOrEmail) => {
    if (!window.confirm(`Are you sure you want to demote/delete admin access for ${nameOrEmail}?`)) {
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      await adminsService.deleteAdminOrInvite(id);
      setSuccess('Access privilege successfully revoked.');
      loadAdmins();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to demote or revoke invite.');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Manage Admin Accounts</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">Create fully formed credentials directly or allowlist invited emails</p>
      </div>

      {/* Global alert feedback */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-xs text-[var(--color-error)]">
          ⚠ {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 rounded-xl bg-[var(--color-success-bg)] border border-[var(--color-success)]/20 text-xs text-[var(--color-success)] font-medium">
          ✓ {success}
        </div>
      )}

      {/* Creation Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Method 1: Create Admin Account (Primary) */}
        <div className="glass-card p-6 border-t-2 border-red-500 bg-red-500/[0.01]">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            🔑 Create Admin Account
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mb-4 leading-relaxed">
            Create an active, fully-formed administrator login credentials immediately. No OTP required, and no automated emails will be sent.
          </p>

          <form onSubmit={handleCreateCredentials} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Full Name</label>
                <input
                  id="create-admin-name"
                  type="text"
                  placeholder="e.g. Prasad Rao"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Email Address</label>
                <input
                  id="create-admin-email"
                  type="email"
                  placeholder="name@gprec.ac.in"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Password</label>
                <input
                  id="create-admin-password"
                  type="password"
                  placeholder="Min 8 chars, 1 num"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Confirm Password</label>
                <input
                  id="create-admin-confirm"
                  type="password"
                  placeholder="Retype password"
                  value={createForm.confirmPassword}
                  onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none"
                />
              </div>
            </div>

            <button id="create-admin-submit" type="submit" className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg mt-2 w-fit">
              Create Admin Account
            </button>
          </form>
        </div>

        {/* Method 2: Invite by Email Allow-List (Legacy) */}
        <div className="glass-card p-6 border-t-2 border-[var(--color-border)]">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            ✉️ Invite by Email (Allow-List)
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mb-4 leading-relaxed">
            Invite an admin by adding their email to the allow-list. They will complete self-registration using the student OTP signup path and automatically receive administrative privileges.
          </p>

          <form onSubmit={handleAddInvite} className="flex flex-col gap-3 mt-6">
            <div>
              <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Coordinator Email Address</label>
              <input
                id="admin-invite-email"
                type="email"
                placeholder="coordinator@gprec.ac.in"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none"
              />
            </div>
            <button id="admin-invite-submit" type="submit" className="px-4 py-2 border border-red-500/50 text-red-500 hover:bg-red-500/5 font-bold text-xs rounded-lg w-fit">
              Allowlist Email
            </button>
          </form>
        </div>

      </div>

      {/* Admins & Invites Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        
        {/* Active Admins List */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
            🛡️ Active Administrators
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]">
              {activeAdmins.length}
            </span>
          </h3>

          <div className="divide-y divide-[var(--color-border)]/50">
            {activeAdmins.length > 0 ? (
              activeAdmins.map((admin) => (
                <div key={admin._id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--color-text-primary)]">{admin.name || 'Coordinator'}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{admin.email}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAdminOrInvite(admin._id, admin.name || admin.email)}
                    className="px-2 py-1.5 border border-[var(--color-border)] hover:bg-red-500/10 text-red-400 hover:text-red-500 rounded-lg text-[10px] font-bold"
                  >
                    Demote
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--color-text-muted)] py-4 italic">No active administrators found.</p>
            )}
          </div>
        </div>

        {/* Pending Invites List */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
            ✉️ Pending Allowlist Invites
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]">
              {pendingInvites.length}
            </span>
          </h3>

          <div className="divide-y divide-[var(--color-border)]/50">
            {pendingInvites.length > 0 ? (
              pendingInvites.map((invite) => (
                <div key={invite._id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--color-text-primary)]">{invite.email}</p>
                    <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-1.5 rounded">
                      Invited
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteAdminOrInvite(invite._id, invite.email)}
                    className="px-2 py-1.5 border border-[var(--color-border)] hover:bg-red-500/10 text-red-400 hover:text-red-500 rounded-lg text-[10px] font-bold"
                  >
                    Cancel Invite
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--color-text-muted)] py-4 italic">No pending invitations.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
