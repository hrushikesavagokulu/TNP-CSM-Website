import { useState, useEffect, useCallback } from 'react';
import adminAchievementService from '../../services/admin/achievements.service';
import ContentBlockEditor from '../../components/shared/ContentBlockEditor';

function AchievementForm({ initial, onSave, onCancel }) {
  const [title,       setTitle]       = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [date,        setDate]        = useState(initial?.date ? new Date(initial.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [media,       setMedia]       = useState(initial?.media || []);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }
    setError(''); setSaving(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        date,
        media,
      };

      if (initial?._id) {
        await adminAchievementService.update(initial._id, payload);
      } else {
        await adminAchievementService.create(payload);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save achievement.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">⚠ {error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Achievement Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. CSM Team Wins National AI Hackathon 2026"
            className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs font-semibold"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs font-mono"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Description / Spotlight Details</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Provide context, winner names, awards won, and department highlights..."
          className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs leading-relaxed"
        />
      </div>

      {/* REUSED ContentBlockEditor for rich media blocks */}
      <div className="border border-[var(--color-border)] rounded-xl p-4 bg-[var(--color-surface)]/50">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Media & Attachments (Content Blocks)</h4>
        <ContentBlockEditor blocks={media} onChange={setMedia} />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-secondary)]">
            Cancel
          </button>
        )}
        <button type="submit" disabled={saving} className="px-5 py-2 bg-[var(--color-accent)] text-white font-bold text-xs rounded-xl disabled:opacity-50">
          {saving ? 'Saving...' : initial ? 'Update Achievement' : 'Publish Achievement'}
        </button>
      </div>
    </form>
  );
}

export default function ManageAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [search, setSearch]             = useState('');
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editTarget, setEditTarget]     = useState(null);

  const load = useCallback(async (querySearch = '') => {
    setLoading(true);
    try {
      const res = await adminAchievementService.list(querySearch);
      setAchievements(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(search); }, [load, search]);

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete achievement "${item.title}"?`)) return;
    try {
      await adminAchievementService.remove(item._id);
      load(search);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Manage Department Achievements</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Post, edit, and search CSM department achievements and student spotlights</p>
        </div>
        {!showForm && !editTarget && (
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-[var(--color-accent)] text-white font-bold text-xs rounded-xl">
            + Post New Achievement
          </button>
        )}
      </div>

      {(showForm || editTarget) && (
        <div className="glass-card p-6 border-l-4 border-[var(--color-accent)]">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">
            {editTarget ? 'Edit Achievement' : 'Post New Achievement'}
          </h3>
          <AchievementForm
            initial={editTarget}
            onSave={() => { setShowForm(false); setEditTarget(null); load(search); }}
            onCancel={() => { setShowForm(false); setEditTarget(null); }}
          />
        </div>
      )}

      {/* Search Bar */}
      <div className="glass-card p-3 border border-[var(--color-border)] flex items-center gap-2">
        <span className="text-sm px-2">🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search achievements by title or keyword..."
          className="flex-1 bg-transparent border-none text-xs text-[var(--color-text-primary)] focus:outline-none placeholder-[var(--color-text-muted)]"
        />
        {search && <button onClick={() => setSearch('')} className="text-xs text-[var(--color-text-muted)] px-2 font-bold">Clear</button>}
      </div>

      {/* List */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
          Existing Achievements ({achievements.length})
        </h3>
        {loading ? (
          <p className="text-xs text-[var(--color-text-muted)] italic">Loading achievements...</p>
        ) : achievements.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)] italic">No achievements found.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {achievements.map((item) => (
              <div key={item._id} className="p-4 border border-[var(--color-border)] rounded-xl flex items-center justify-between gap-4 bg-[var(--color-surface)]">
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-bold text-[var(--color-text-primary)]">{item.title}</h4>
                  <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-1">{item.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)] font-mono mt-1">
                    <span>📅 {new Date(item.date).toLocaleDateString()}</span>
                    <span>📷 {item.media?.length || 0} media blocks</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => { setEditTarget(item); setShowForm(false); }} className="px-3 py-1 border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)] rounded-lg">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item)} className="px-3 py-1 border border-[var(--color-border)] text-red-500 hover:bg-red-500/10 text-xs font-bold rounded-lg">
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
