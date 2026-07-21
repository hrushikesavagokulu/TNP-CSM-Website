import { useState, useEffect, useCallback } from 'react';
import adminCertificationService from '../../services/admin/certification.service';
import ContentBlockEditor from '../../components/shared/ContentBlockEditor';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

function ItemForm({ initial, onSave, onCancel }) {
  const [semester,      setSemester]      = useState(initial?.semester || 1);
  const [name,          setName]          = useState(initial?.name || '');
  const [description,   setDescription]   = useState(initial?.description || '');
  const [order,         setOrder]         = useState(initial?.order ?? 0);
  const [contentBlocks, setContentBlocks] = useState(initial?.contentBlocks || []);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Certification name is required.'); return; }
    setError(''); setSaving(true);
    try {
      const payload = {
        semester: Number(semester), name: name.trim(),
        description: description.trim(), order: Number(order),
        contentBlocks: contentBlocks.map((b, i) => ({ type: b.type, label: b.label, value: b.value, order: b.order ?? i })),
      };
      if (initial?._id) await adminCertificationService.update(initial._id, payload);
      else await adminCertificationService.create(payload);
      onSave();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">⚠ {error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Semester *</label>
          <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs">
            {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Certification Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. NPTEL Python, Coursera ML" className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
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

export default function ManageCertifications() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSem, setActiveSem] = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const data = await adminCertificationService.list(); setItems(data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const displayed = activeSem ? items.filter((i) => i.semester === activeSem) : items;

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try { await adminCertificationService.remove(item._id); load(); }
    catch (err) { alert(err.response?.data?.message || 'Delete failed.'); }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Manage Certifications</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Add semester-wise recommended certifications</p>
        </div>
        {!showForm && !editTarget && <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-[var(--color-accent)] text-white font-bold text-xs rounded-xl">+ Add Certification</button>}
      </div>

      {(showForm || editTarget) && (
        <div className="glass-card p-6 border-l-4 border-[var(--color-accent)]">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">{editTarget ? 'Edit Certification' : 'New Certification'}</h3>
          <ItemForm initial={editTarget} onSave={() => { setShowForm(false); setEditTarget(null); load(); }} onCancel={() => { setShowForm(false); setEditTarget(null); }} />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveSem(null)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${!activeSem ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>All</button>
        {SEMESTERS.map((sem) => <button key={sem} onClick={() => setActiveSem(sem)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${activeSem === sem ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>Sem {sem}</button>)}
      </div>

      <div className="glass-card p-4">
        {loading ? <p className="text-xs text-[var(--color-text-muted)] italic">Loading...</p> : displayed.length === 0 ? <p className="text-xs text-[var(--color-text-muted)] italic">No certifications yet.</p> : (
          <div className="flex flex-col gap-2">
            {displayed.map((item) => (
              <div key={item._id} className="p-3 border border-[var(--color-border)] rounded-xl flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2"><span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border border-[var(--color-border)] font-mono">Sem {item.semester}</span><span className="text-sm font-bold text-[var(--color-text-primary)]">{item.name}</span></div>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{item.contentBlocks?.length ?? 0} blocks</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditTarget(item); setShowForm(false); }} className="px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-xs font-bold text-[var(--color-text-secondary)]">Edit</button>
                  <button onClick={() => handleDelete(item)} className="px-3 py-1.5 border border-[var(--color-border)] text-red-500 hover:bg-red-500/10 rounded-lg text-xs font-bold">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
