import { useState, useEffect, useCallback } from 'react';
import adminResumeGuideService from '../../services/admin/resumeGuide.service';
import ContentBlockEditor from '../../components/shared/ContentBlockEditor';

function ItemForm({ initial, onSave, onCancel }) {
  const [title,         setTitle]         = useState(initial?.title || '');
  const [description,   setDescription]   = useState(initial?.description || '');
  const [order,         setOrder]         = useState(initial?.order ?? 0);
  const [contentBlocks, setContentBlocks] = useState(initial?.contentBlocks || []);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }
    setError(''); setSaving(true);
    try {
      const payload = {
        title: title.trim(), description: description.trim(), order: Number(order),
        contentBlocks: contentBlocks.map((b, i) => ({ type: b.type, label: b.label, value: b.value, order: b.order ?? i })),
      };
      if (initial?._id) await adminResumeGuideService.update(initial._id, payload);
      else await adminResumeGuideService.create(payload);
      onSave();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">⚠ {error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="col-span-3">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Section Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Work Experience, Projects, Skills" className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Order</label>
          <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
        </div>
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
      </div>
      <div className="border border-[var(--color-border)] rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Content Blocks</p>
        <ContentBlockEditor blocks={contentBlocks} onChange={setContentBlocks} />
      </div>
      <div className="flex gap-2 justify-end">
        {onCancel && <button type="button" onClick={onCancel} className="px-4 py-2 border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-secondary)]">Cancel</button>}
        <button type="submit" disabled={saving} className="px-4 py-2 bg-[var(--color-accent)] text-white font-bold text-xs rounded-xl disabled:opacity-50">{saving ? 'Saving…' : initial ? 'Update' : 'Create'}</button>
      </div>
    </form>
  );
}

export default function ManageResumeGuide() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const data = await adminResumeGuideService.list(); setSections(data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (section) => {
    if (!window.confirm(`Delete section "${section.title}"?`)) return;
    try { await adminResumeGuideService.remove(section._id); load(); }
    catch (err) { alert(err.response?.data?.message || 'Delete failed.'); }
  };

  const sorted = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Manage Resume Guide</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Build resume guidance sections — templates, tips, examples</p>
        </div>
        {!showForm && !editTarget && <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-[var(--color-accent)] text-white font-bold text-xs rounded-xl">+ Add Section</button>}
      </div>

      {(showForm || editTarget) && (
        <div className="glass-card p-6 border-l-4 border-[var(--color-accent)]">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">{editTarget ? 'Edit Section' : 'New Section'}</h3>
          <ItemForm initial={editTarget} onSave={() => { setShowForm(false); setEditTarget(null); load(); }} onCancel={() => { setShowForm(false); setEditTarget(null); }} />
        </div>
      )}

      <div className="glass-card p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">{sorted.length} section{sorted.length !== 1 ? 's' : ''} (sorted by order)</h3>
        {loading ? <p className="text-xs text-[var(--color-text-muted)] italic">Loading...</p> : sorted.length === 0 ? <p className="text-xs text-[var(--color-text-muted)] italic">No guide sections yet.</p> : (
          <div className="flex flex-col gap-2">
            {sorted.map((section, idx) => (
              <div key={section._id} className="p-3 border border-[var(--color-border)] rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-black flex items-center justify-center">{idx + 1}</span>
                  <div>
                    <p className="text-sm font-bold text-[var(--color-text-primary)]">{section.title}</p>
                    <span className="text-[10px] text-[var(--color-text-muted)]">{section.contentBlocks?.length ?? 0} blocks · order {section.order}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditTarget(section); setShowForm(false); }} className="px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-xs font-bold text-[var(--color-text-secondary)]">Edit</button>
                  <button onClick={() => handleDelete(section)} className="px-3 py-1.5 border border-[var(--color-border)] text-red-500 hover:bg-red-500/10 rounded-lg text-xs font-bold">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
