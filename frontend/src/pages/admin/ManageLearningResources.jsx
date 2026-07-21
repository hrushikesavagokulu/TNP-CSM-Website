import { useState, useEffect, useCallback } from 'react';
import adminLearningResourceService from '../../services/admin/learningResource.service';
import ContentBlockEditor from '../../components/shared/ContentBlockEditor';

function ItemForm({ initial, onSave, onCancel }) {
  const [skillName,     setSkillName]     = useState(initial?.skillName || '');
  const [order,         setOrder]         = useState(initial?.order ?? 0);
  const [contentBlocks, setContentBlocks] = useState(initial?.contentBlocks || []);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skillName.trim()) { setError('Skill name is required.'); return; }
    setError(''); setSaving(true);
    try {
      const payload = {
        skillName: skillName.trim(), order: Number(order),
        contentBlocks: contentBlocks.map((b, i) => ({ type: b.type, label: b.label, value: b.value, order: b.order ?? i })),
      };
      if (initial?._id) await adminLearningResourceService.update(initial._id, payload);
      else await adminLearningResourceService.create(payload);
      onSave();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">⚠ {error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="col-span-3">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Skill Name *</label>
          <input type="text" value={skillName} onChange={(e) => setSkillName(e.target.value)} placeholder="e.g. React, Python, DSA, DBMS" className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Order</label>
          <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
        </div>
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

export default function ManageLearningResources() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [search, setSearch]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const data = await adminLearningResourceService.list(); setItems(data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const displayed = search.trim() ? items.filter((i) => i.skillName.toLowerCase().includes(search.toLowerCase())) : items;

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete skill "${item.skillName}"?`)) return;
    try { await adminLearningResourceService.remove(item._id); load(); }
    catch (err) { alert(err.response?.data?.message || 'Delete failed.'); }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Manage Learning Resources</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Add skill-grouped resources: links, videos, PDFs, notes</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="text" placeholder="Search skills..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] text-xs rounded-xl w-48" />
          {!showForm && !editTarget && <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-[var(--color-accent)] text-white font-bold text-xs rounded-xl whitespace-nowrap">+ Add Skill</button>}
        </div>
      </div>

      {(showForm || editTarget) && (
        <div className="glass-card p-6 border-l-4 border-[var(--color-accent)]">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">{editTarget ? 'Edit Resource' : 'New Skill Resource'}</h3>
          <ItemForm initial={editTarget} onSave={() => { setShowForm(false); setEditTarget(null); load(); }} onCancel={() => { setShowForm(false); setEditTarget(null); }} />
        </div>
      )}

      <div className="glass-card p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">{displayed.length} skill{displayed.length !== 1 ? 's' : ''}</h3>
        {loading ? <p className="text-xs text-[var(--color-text-muted)] italic">Loading...</p> : displayed.length === 0 ? <p className="text-xs text-[var(--color-text-muted)] italic">No resources yet.</p> : (
          <div className="flex flex-col gap-2">
            {displayed.map((item) => (
              <div key={item._id} className="p-3 border border-[var(--color-border)] rounded-xl flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">{item.skillName}</p>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{item.contentBlocks?.length ?? 0} blocks · order {item.order}</span>
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
