import { useState, useEffect, useCallback } from 'react';
import achievementsAdminService from '../../services/admin/achievements.service';
import FileUploader from '../../components/shared/FileUploader';

function AchievementForm({ initial, onSave, onCancel }) {
  const [title, setTitle]             = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [date, setDate]               = useState(
    initial?.date ? new Date(initial.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [mediaUrl, setMediaUrl]       = useState(initial?.mediaUrl || '');
  const [category, setCategory]       = useState(initial?.category || 'General');
  const [order, setOrder]             = useState(initial?.order ?? 0);

  // Expiry mode: DEFAULT FOR ACHIEVEMENTS IS 'never'
  const [expiryMode, setExpiryMode] = useState(
    initial ? (initial.neverExpires ? 'never' : (initial.expiryMode || 'custom')) : 'never'
  );
  const [customDays, setCustomDays] = useState(initial?.customExpiryDays || 30);

  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (expiryMode === 'custom') {
      const days = parseInt(customDays, 10);
      if (isNaN(days) || days <= 0) {
        setFormError('Custom expiry days must be a positive number.');
        return;
      }
    }
    setFormError('');
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        date: new Date(date),
        mediaUrl,
        category: category.trim(),
        order: Number(order) || 0,
        expiryMode,
        customExpiryDays: expiryMode === 'custom' ? Number(customDays) : undefined,
      };

      if (initial?._id) {
        await achievementsAdminService.updateAchievement(initial._id, payload);
      } else {
        await achievementsAdminService.createAchievement(payload);
      }
      onSave();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save achievement.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {formError && (
        <div className="px-4 py-2.5 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-xs text-[var(--color-error)]">
          ⚠ {formError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. National Hackathon First Prize"
            className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Hackathon, Research, Placement"
            className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Brief details about the accomplishment..."
          className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1">Event / Award Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1">Display Order</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Media Upload */}
      <div>
        <label className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1">Media / Certificate Image</label>
        {mediaUrl ? (
          <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/30">
            <span className="text-xs text-[var(--color-accent)] truncate max-w-xs">{mediaUrl}</span>
            <button
              type="button"
              onClick={() => setMediaUrl('')}
              className="text-xs text-red-500 hover:underline font-bold"
            >
              Remove
            </button>
          </div>
        ) : (
          <FileUploader
            uploadUrl="/admin/achievements/upload-media"
            fieldName="media"
            accept="image/*,application/pdf"
            maxSizeMB={10}
            onUploadComplete={(res) => setMediaUrl(res.url)}
          />
        )}
      </div>

      {/* Expiry Lifespan Settings (DEFAULT: NEVER EXPIRES) */}
      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/20 flex flex-col gap-2.5">
        <label className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider block">Expiry Lifespan *</label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="ach-expiry-mode"
            value="never"
            checked={expiryMode === 'never'}
            onChange={() => setExpiryMode('never')}
          />
          <div>
            <span className="text-xs font-bold text-[var(--color-text-primary)]">Never Expires (Permanent Record - Default)</span>
            <span className="text-[10px] text-[var(--color-text-muted)] block">Kept indefinitely in historical records</span>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="ach-expiry-mode"
            value="custom"
            checked={expiryMode === 'custom'}
            onChange={() => setExpiryMode('custom')}
          />
          <div>
            <span className="text-xs font-bold text-[var(--color-text-primary)]">Custom Time-Limited Expiry</span>
            <span className="text-[10px] text-[var(--color-text-muted)] block">Specify number of days before automatic cleanup</span>
          </div>
        </label>

        {expiryMode === 'custom' && (
          <div className="pl-7 flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              className="w-24 px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs font-mono"
            />
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">days from achievement date</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end mt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-secondary)]">
            Cancel
          </button>
        )}
        <button type="submit" disabled={saving} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl disabled:opacity-50">
          {saving ? 'Saving…' : initial ? 'Update Achievement' : 'Create Achievement'}
        </button>
      </div>
    </form>
  );
}

export default function ManageAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [pagination, setPagination]     = useState(null);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editTarget, setEditTarget]     = useState(null);

  const loadAchievements = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await achievementsAdminService.getAchievements({ page, limit: 15 });
      setAchievements(data.achievements);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAchievements(); }, [loadAchievements]);

  const handleSaved = () => {
    setShowForm(false);
    setEditTarget(null);
    loadAchievements();
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete achievement "${item.title}"?`)) return;
    try {
      await achievementsAdminService.deleteAchievement(item._id);
      loadAchievements();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Department Achievements</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Manage departmental awards, spotlights, and milestones</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditTarget(null); }}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl"
          >
            + New Achievement
          </button>
        )}
      </div>

      {(showForm || editTarget) && (
        <div className="glass-card p-6 border-l-4 border-red-500">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">
            {editTarget ? 'Edit Achievement' : 'New Achievement'}
          </h3>
          <AchievementForm
            initial={editTarget}
            onSave={handleSaved}
            onCancel={() => { setShowForm(false); setEditTarget(null); }}
          />
        </div>
      )}

      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-4">
          All Department Achievements ({pagination?.total ?? '…'})
        </h3>

        {loading ? (
          <p className="text-xs text-[var(--color-text-muted)] italic">Loading achievements...</p>
        ) : achievements.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)] italic">No department achievements posted yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {achievements.map((item) => (
              <div key={item._id} className="p-4 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--color-text-primary)]">{item.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                      {item.category || 'General'}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)] mt-1 font-mono">
                    <span>📅 {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span>·</span>
                    <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${
                      item.neverExpires || item.remainingDays === null
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : item.remainingDays <= 7
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {item.neverExpires || item.remainingDays === null
                        ? '♾️ Never expires'
                        : `⏳ ${item.remainingDays} ${item.remainingDays === 1 ? 'day' : 'days'} remaining`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setEditTarget(item); setShowForm(false); }}
                    className="px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="px-3 py-1.5 border border-[var(--color-border)] text-red-500 hover:bg-red-500/10 rounded-lg text-xs font-bold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
