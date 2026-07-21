import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import announcementsAdminService from '../../services/admin/announcements.service';
import batchesService            from '../../services/admin/batches.service';
import FileUploader              from '../../components/shared/FileUploader';

const YEARS = [1, 2, 3, 4];

// ── Announcement Form ─────────────────────────────────────────────────────────
function AnnouncementForm({ initial, onSave, onCancel }) {
  const [title, setTitle]               = useState(initial?.title || '');
  const [body, setBody]                 = useState(initial?.body  || '');
  const [isGeneral, setIsGeneral]       = useState(initial?.isGeneral ?? false);
  const [targetYears, setTargetYears]   = useState(initial?.targetYears  || []);
  const [targetBatches, setTargetBatches] = useState(
    (initial?.targetBatches || []).map((b) => (typeof b === 'object' ? b._id : b))
  );
  const [attachments, setAttachments]   = useState(initial?.attachments || []);
  const [availableBatches, setAvailableBatches] = useState([]); // fetched by year
  const [saving, setSaving]             = useState(false);
  const [formError, setFormError]       = useState('');

  // Fetch available batches whenever year 3 or 4 is in targetYears
  useEffect(() => {
    const fetchBatches = async () => {
      const needs3 = targetYears.includes(3);
      const needs4 = targetYears.includes(4);
      if (!needs3 && !needs4) {
        setAvailableBatches([]);
        // Clear batch selections that are no longer reachable
        setTargetBatches([]);
        return;
      }
      try {
        const results = await Promise.all([
          needs3 ? batchesService.getBatches(3) : Promise.resolve([]),
          needs4 ? batchesService.getBatches(4) : Promise.resolve([]),
        ]);
        setAvailableBatches([...results[0], ...results[1]]);
      } catch (err) {
        console.error('Failed to load batches:', err);
      }
    };
    fetchBatches();
  }, [targetYears.join(',')]); // eslint-disable-line

  // Expiry mode state
  const [expiryMode, setExpiryMode] = useState(
    initial?.neverExpires ? 'never' : (initial?.expiryMode || 'default')
  );
  const [customDays, setCustomDays] = useState(initial?.customExpiryDays || 30);

  const toggleYear = (yr) => {
    setTargetYears((prev) =>
      prev.includes(yr) ? prev.filter((y) => y !== yr) : [...prev, yr]
    );
  };

  const toggleBatch = (id) => {
    setTargetBatches((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const validate = () => {
    if (!title.trim()) return 'Title is required.';
    if (!body.trim())  return 'Body is required.';
    if (!isGeneral && targetYears.length === 0 && targetBatches.length === 0) {
      return 'You must target at least one group: General, one or more years, or one or more batches.';
    }
    if (expiryMode === 'custom') {
      const days = parseInt(customDays, 10);
      if (isNaN(days) || days <= 0) return 'Custom expiry days must be a positive number.';
      if (days > 250) return 'Custom expiry days cannot exceed 250 days. Use "Never expires" for permanent announcements.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setFormError(err); return; }
    setFormError('');
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        body:  body.trim(),
        isGeneral,
        targetYears:   isGeneral ? [] : targetYears,
        targetBatches: isGeneral ? [] : targetBatches,
        attachments,
        expiryMode,
        customExpiryDays: expiryMode === 'custom' ? Number(customDays) : undefined,
      };
      if (initial?._id) {
        await announcementsAdminService.updateAnnouncement(initial._id, payload);
      } else {
        await announcementsAdminService.createAnnouncement(payload);
      }
      onSave();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save announcement.');
    } finally {
      setSaving(false);
    }
  };

  const showBatchSelector = !isGeneral && (targetYears.includes(3) || targetYears.includes(4));

  return (
    <form className="announcement-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="ann-title" className="form-label">Title *</label>
        <input
          id="ann-title"
          type="text"
          className="form-input"
          placeholder="Announcement title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
        />
      </div>

      <div className="form-group">
        <label htmlFor="ann-body" className="form-label">Body *</label>
        <textarea
          id="ann-body"
          className="form-input form-textarea"
          placeholder="Write your announcement here…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
        />
      </div>

      {/* Targeting */}
      <div className="form-group">
        <p className="form-label">Target Audience *</p>

        {/* General checkbox */}
        <label className="checkbox-row big">
          <input
            id="target-general"
            type="checkbox"
            checked={isGeneral}
            onChange={(e) => setIsGeneral(e.target.checked)}
          />
          <div>
            <span className="checkbox-label">🌐 General — All Students</span>
            <span className="checkbox-hint">Visible to every student, all years, all batches.</span>
          </div>
        </label>

        {!isGeneral && (
          <>
            {/* Year checkboxes */}
            <p className="targeting-subsection-label">Or target specific years:</p>
            <div className="year-checkboxes">
              {YEARS.map((yr) => (
                <label key={yr} className="checkbox-row">
                  <input
                    id={`target-year-${yr}`}
                    type="checkbox"
                    checked={targetYears.includes(yr)}
                    onChange={() => toggleYear(yr)}
                  />
                  <span className="checkbox-label">Year {yr}</span>
                </label>
              ))}
            </div>

            {/* Batch selector — only when year 3 or 4 is selected */}
            {showBatchSelector && (
              <>
                <p className="targeting-subsection-label">Optionally target specific batches (Year 3/4 only):</p>
                {availableBatches.length === 0 ? (
                  <p className="hint">
                    No batches defined for the selected year(s). &nbsp;
                    <Link to="/admin/batches" className="hint-link">→ Go to Manage Batches</Link>
                  </p>
                ) : (
                  <div className="batch-checkboxes">
                    {availableBatches.map((b) => (
                      <label key={b._id} className="checkbox-row">
                        <input
                          id={`target-batch-${b._id}`}
                          type="checkbox"
                          checked={targetBatches.includes(b._id)}
                          onChange={() => toggleBatch(b._id)}
                        />
                        <span className="checkbox-label">
                          {b.name} <span className="badge-sm">Y{b.year}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Expiry Settings */}
      <div className="form-group">
        <label className="form-label">Expiry Lifespan *</label>
        <div className="flex flex-col gap-2.5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="ann-expiry-mode"
              value="default"
              checked={expiryMode === 'default'}
              onChange={() => setExpiryMode('default')}
            />
            <div>
              <span className="text-xs font-bold text-[var(--color-text-primary)]">Default Lifespan (250 Days)</span>
              <span className="text-[10px] text-[var(--color-text-muted)] block">Automatically expires after ~8 months</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="ann-expiry-mode"
              value="custom"
              checked={expiryMode === 'custom'}
              onChange={() => setExpiryMode('custom')}
            />
            <div>
              <span className="text-xs font-bold text-[var(--color-text-primary)]">Custom Shorter Expiry</span>
              <span className="text-[10px] text-[var(--color-text-muted)] block">Specify number of days (must be ≤ 250 days)</span>
            </div>
          </label>

          {expiryMode === 'custom' && (
            <div className="pl-7 flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="250"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                className="w-24 px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs font-mono"
              />
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">days from today</span>
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="ann-expiry-mode"
              value="never"
              checked={expiryMode === 'never'}
              onChange={() => setExpiryMode('never')}
            />
            <div>
              <span className="text-xs font-bold text-[var(--color-text-primary)]">Never Expires (Permanent)</span>
              <span className="text-[10px] text-[var(--color-text-muted)] block">Kept until manually deleted</span>
            </div>
          </label>
        </div>
      </div>

      {/* Attachments Upload/List */}
      <div className="form-group">
        <label className="form-label">Attachments (Images, Videos, Documents)</label>
        
        {attachments.length > 0 && (
          <div className="admin-attachments-list">
            {attachments.map((att, idx) => (
              <div key={idx} className="admin-attachment-item">
                <span className="admin-attachment-name">
                  {att.mimeType?.startsWith('image/') ? '🖼️ ' : att.mimeType?.startsWith('video/') ? '🎥 ' : '📄 '}
                  {att.filename}
                </span>
                <button
                  type="button"
                  className="btn-remove-attachment"
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                >
                  ✕ Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="file-uploader-wrapper">
          <FileUploader
            uploadUrl="/admin/announcements/upload-attachment"
            fieldName="file"
            accept="*"
            maxSizeMB={50}
            onUploadComplete={(url, data) => {
              setAttachments(prev => [...prev, {
                url,
                filename: data.filename || 'Attachment',
                mimeType: data.mimeType || 'application/octet-stream'
              }]);
            }}
          />
        </div>
      </div>

      {formError && <p className="form-error">{formError}</p>}

      <div className="form-actions">
        <button type="submit" className="btn-accent" disabled={saving}>
          {saving ? 'Saving…' : (initial?._id ? 'Update' : 'Post Announcement')}
        </button>
        {onCancel && (
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [pagination, setPagination]       = useState(null);
  const [loading, setLoading]             = useState(true);
  const [showForm, setShowForm]           = useState(false);
  const [editTarget, setEditTarget]       = useState(null);

  const loadAnnouncements = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await announcementsAdminService.getAnnouncements({ page, limit: 15 });
      setAnnouncements(data.announcements);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);

  const handleSaved = () => {
    setShowForm(false);
    setEditTarget(null);
    loadAnnouncements();
  };

  const handleDelete = async (ann) => {
    if (!window.confirm(`Delete "${ann.title}"?`)) return;
    try {
      await announcementsAdminService.deleteAnnouncement(ann._id);
      loadAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  const targetingLabel = (ann) => {
    const parts = [];
    if (ann.isGeneral) parts.push('🌐 General');
    if (ann.targetYears?.length > 0) parts.push(ann.targetYears.map((y) => `Year ${y}`).join(', '));
    if (ann.targetBatches?.length > 0) {
      const names = ann.targetBatches.map((b) => (typeof b === 'object' ? b.name : b));
      parts.push(names.join(', '));
    }
    return parts.join(' · ') || '—';
  };

  return (
    <div className="manage-announcements">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Announcements</h1>
          <p className="page-subtitle">Post and manage announcements to students by year, batch, or the entire department.</p>
        </div>
        {!showForm && (
          <button id="btn-new-announcement" className="btn-accent" onClick={() => { setShowForm(true); setEditTarget(null); }}>
            + New Announcement
          </button>
        )}
      </div>

      {/* Create / Edit Form */}
      {(showForm || editTarget) && (
        <div className="glass-card form-card">
          <h3 className="section-title">{editTarget ? 'Edit Announcement' : 'New Announcement'}</h3>
          <AnnouncementForm
            initial={editTarget}
            onSave={handleSaved}
            onCancel={() => { setShowForm(false); setEditTarget(null); }}
          />
        </div>
      )}

      {/* Announcements List */}
      <div className="glass-card list-card">
        <h3 className="section-title">All Announcements ({pagination?.total ?? '…'})</h3>
        {loading ? (
          <div className="skeleton-list">
            {[1,2,3].map(i => <div key={i} className="skeleton-row" />)}
          </div>
        ) : announcements.length === 0 ? (
          <p className="empty-text">No announcements yet.</p>
        ) : (
          <ul className="announcement-list">
            {announcements.map((ann) => (
              <li key={ann._id} className="announcement-item">
                <div className="ann-content">
                  <p className="ann-title">{ann.title}</p>
                  <p className="ann-body-preview">{ann.body.length > 120 ? ann.body.slice(0, 120) + '…' : ann.body}</p>
                  <p className="ann-meta">
                    <span>{targetingLabel(ann)}</span>
                    <span className="dot">·</span>
                    <span>{new Date(ann.postedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {ann.postedBy && <><span className="dot">·</span><span>by {ann.postedBy.name}</span></>}
                    <span className="dot">·</span>
                    <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ann.neverExpires || ann.remainingDays === null
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : ann.remainingDays <= 7
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {ann.neverExpires || ann.remainingDays === null
                        ? '♾️ Never expires'
                        : `⏳ ${ann.remainingDays} ${ann.remainingDays === 1 ? 'day' : 'days'} remaining`}
                    </span>
                  </p>
                </div>
                <div className="ann-actions">
                  <button
                    className="btn-ghost btn-sm"
                    onClick={() => { setEditTarget(ann); setShowForm(false); }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-danger-sm"
                    onClick={() => handleDelete(ann)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`page-btn${p === pagination.page ? ' active' : ''}`}
                onClick={() => loadAnnouncements(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .manage-announcements { padding: 2rem; max-width: 960px; animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .page-title { font-size: 1.75rem; font-weight: 800; color: var(--color-text-primary); margin: 0 0 0.25rem; }
        .page-subtitle { color: var(--color-text-muted); font-size: 0.875rem; margin: 0; }

        .glass-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-text-muted);
          margin: 0 0 1.25rem;
        }

        .announcement-form { display: flex; flex-direction: column; gap: 1.25rem; }

        .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-input {
          padding: 0.65rem 0.9rem;
          border-radius: 10px;
          border: 1px solid var(--color-border);
          background: var(--color-bg);
          color: var(--color-text-primary);
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
          font-family: inherit;
        }

        .form-input:focus { border-color: var(--color-accent); }
        .form-textarea { resize: vertical; min-height: 100px; }

        .checkbox-row {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          padding: 0.6rem 0.75rem;
          border-radius: 10px;
          border: 1px solid var(--color-border);
          background: var(--color-bg);
          cursor: pointer;
          transition: border-color 0.15s;
          margin-bottom: 4px;
        }

        .checkbox-row:hover { border-color: var(--color-accent); }
        .checkbox-row.big { padding: 0.9rem 1rem; }

        .checkbox-row input[type="checkbox"] { margin-top: 2px; flex-shrink: 0; accent-color: var(--color-accent); }
        .checkbox-label { font-size: 0.875rem; font-weight: 600; color: var(--color-text-primary); }
        .checkbox-hint { display: block; font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px; }

        .targeting-subsection-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0.75rem 0 0.4rem;
        }

        .year-checkboxes { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
        .batch-checkboxes { display: flex; flex-direction: column; gap: 4px; }

        .badge-sm {
          font-size: 0.6rem;
          background: var(--color-accent);
          color: #000;
          padding: 1px 5px;
          border-radius: 999px;
          font-weight: 700;
          margin-left: 4px;
        }

        .hint { font-size: 0.75rem; color: var(--color-text-muted); margin: 0.3rem 0; }

        .form-error {
          font-size: 0.825rem;
          color: var(--color-error);
          background: var(--color-error-bg);
          border: 1px solid var(--color-error);
          border-radius: 8px;
          padding: 0.6rem 0.8rem;
        }

        .form-actions { display: flex; gap: 0.75rem; }

        .btn-accent {
          padding: 0.65rem 1.5rem;
          background: var(--color-accent);
          color: #000;
          border: none;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.15s;
        }

        .btn-accent:hover:not(:disabled) { opacity: 0.85; }
        .btn-accent:disabled { opacity: 0.45; cursor: not-allowed; }

        .btn-ghost {
          padding: 0.55rem 1rem;
          background: transparent;
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
          border-radius: 10px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-ghost:hover { border-color: var(--color-accent); color: var(--color-accent); }
        .btn-sm { padding: 0.3rem 0.65rem !important; font-size: 0.75rem !important; }

        .btn-danger-sm {
          padding: 0.3rem 0.65rem;
          background: transparent;
          color: var(--color-error);
          border: 1px solid var(--color-error);
          border-radius: 8px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-danger-sm:hover { background: var(--color-error); color: #fff; }

        .announcement-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }

        .announcement-item {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid var(--color-border);
          background: var(--color-bg);
          transition: border-color 0.15s;
        }

        .announcement-item:hover { border-color: var(--color-accent); }
        .ann-content { flex: 1; }
        .ann-title { font-weight: 700; font-size: 0.95rem; color: var(--color-text-primary); margin: 0 0 0.25rem; }
        .ann-body-preview { font-size: 0.8rem; color: var(--color-text-muted); margin: 0 0 0.4rem; }

        .ann-meta {
          font-size: 0.72rem;
          color: var(--color-text-muted);
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
          align-items: center;
        }

        .dot { color: var(--color-border); }
        .ann-actions { display: flex; gap: 6px; flex-shrink: 0; align-items: flex-start; }

        .pagination { display: flex; gap: 4px; justify-content: center; margin-top: 1rem; }
        .page-btn {
          padding: 0.35rem 0.65rem;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          background: transparent;
          color: var(--color-text-secondary);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .page-btn:hover, .page-btn.active {
          background: var(--color-accent);
          color: #000;
          border-color: var(--color-accent);
          font-weight: 700;
        }

        .skeleton-list { display: flex; flex-direction: column; gap: 8px; }
        .skeleton-row {
          height: 70px;
          border-radius: 12px;
          background: var(--color-surface-raised);
          animation: skeleton-pulse 1.4s ease-in-out infinite;
        }

        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        .empty-text { color: var(--color-text-muted); font-size: 0.875rem; }
        .hint { font-size: 0.8rem; color: var(--color-text-muted); margin: 0.25rem 0; }
        .hint-link { color: var(--color-accent); font-weight: 600; text-decoration: none; }
        .hint-link:hover { text-decoration: underline; }

        .admin-attachments-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 0.75rem;
        }

        .admin-attachment-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--color-surface-raised);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 8px 12px;
        }

        .admin-attachment-name {
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          word-break: break-all;
        }

        .btn-remove-attachment {
          background: transparent;
          border: none;
          color: var(--color-error);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 4px;
          transition: background 0.15s;
        }

        .btn-remove-attachment:hover {
          background: var(--color-error-bg);
        }

        .file-uploader-wrapper {
          margin-top: 0.5rem;
        }
      `}</style>

    </div>
  );
}
