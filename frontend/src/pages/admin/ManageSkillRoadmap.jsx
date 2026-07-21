import { useState, useEffect, useCallback } from 'react';
import adminSkillRoadmapService from '../../services/admin/skillRoadmap.service';
import ContentBlockEditor from '../../components/shared/ContentBlockEditor';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

function ItemForm({ initial, onSave, onCancel }) {
  const [semester,       setSemester]       = useState(initial?.semester || 1);
  const [skillGroupName, setSkillGroupName] = useState(initial?.skillGroupName || '');
  const [description,    setDescription]    = useState(initial?.description || '');
  const [mandatory,      setMandatory]      = useState(initial?.mandatory ?? false);
  const [order,          setOrder]          = useState(initial?.order ?? 0);
  const [contentBlocks,  setContentBlocks]  = useState(initial?.contentBlocks || []);
  const [saving, setSaving]   = useState(false);
  const [error,  setError]    = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skillGroupName.trim()) { setError('Skill group name is required.'); return; }
    setError(''); setSaving(true);
    try {
      const payload = {
        semester: Number(semester),
        skillGroupName: skillGroupName.trim(),
        description: description.trim(),
        mandatory,
        order: Number(order),
        contentBlocks: contentBlocks.map((b, i) => ({
          type: b.type, label: b.label, value: b.value, order: b.order ?? i,
        })),
      };
      if (initial?._id) await adminSkillRoadmapService.update(initial._id, payload);
      else await adminSkillRoadmapService.create(payload);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">⚠ {error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Semester *</label>
          <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs">
            {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Skill Group Name *</label>
          <input type="text" value={skillGroupName} onChange={(e) => setSkillGroupName(e.target.value)} placeholder="e.g. Data Structures & Algorithms" className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Order</label>
          <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Optional short description..." className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={mandatory} onChange={(e) => setMandatory(e.target.checked)} className="accent-red-500 w-4 h-4" />
        <div>
          <span className="text-xs font-bold text-[var(--color-text-primary)]">Mark as Mandatory</span>
          <span className="text-[10px] text-[var(--color-text-muted)] block">Highlighted with a red badge on student view</span>
        </div>
      </label>

      <div className="border border-[var(--color-border)] rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Content Blocks</p>
        <ContentBlockEditor blocks={contentBlocks} onChange={setContentBlocks} />
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && <button type="button" onClick={onCancel} className="px-4 py-2 border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-secondary)]">Cancel</button>}
        <button type="submit" disabled={saving} className="px-4 py-2 bg-[var(--color-accent)] text-white font-bold text-xs rounded-xl disabled:opacity-50">
          {saving ? 'Saving…' : initial ? 'Update Item' : 'Create Item'}
        </button>
      </div>
    </form>
  );
}

export default function ManageSkillRoadmap() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeSem, setActiveSem] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminSkillRoadmapService.list();
      setItems(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const semItems = items.filter((i) => i.semester === activeSem).sort((a,b)=>a.order-b.order);

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.skillGroupName}"?`)) return;
    try { await adminSkillRoadmapService.remove(item._id); load(); }
    catch (err) { alert(err.response?.data?.message || 'Delete failed.'); }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Manage Skill Roadmap</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Add/edit semester-wise skill groups and their learning resources</p>
        </div>
        {!showForm && !editTarget && (
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-[var(--color-accent)] text-white font-bold text-xs rounded-xl">
            + Add Skill Group
          </button>
        )}
      </div>

      {(showForm || editTarget) && (
        <div className="glass-card p-6 border-l-4 border-[var(--color-accent)]">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">{editTarget ? 'Edit Skill Group' : 'New Skill Group'}</h3>
          <ItemForm
            initial={editTarget}
            onSave={() => { setShowForm(false); setEditTarget(null); load(); }}
            onCancel={() => { setShowForm(false); setEditTarget(null); }}
          />
        </div>
      )}

      {/* Semester tabs */}
      <div className="flex flex-wrap gap-2">
        {SEMESTERS.map((sem) => {
          const count = items.filter((i) => i.semester === sem).length;
          return (
            <button key={sem} onClick={() => setActiveSem(sem)} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${activeSem === sem ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>
              Sem {sem} {count > 0 && <span className={`ml-1 text-[9px] px-1 py-0.5 rounded-full ${activeSem === sem ? 'bg-white/20' : 'bg-[var(--color-bg-secondary)]'}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="glass-card p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Semester {activeSem} — {semItems.length} item{semItems.length !== 1 ? 's' : ''}</h3>
        {loading ? (
          <p className="text-xs text-[var(--color-text-muted)] italic">Loading...</p>
        ) : semItems.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)] italic">No skill groups for this semester. Add one above.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {semItems.map((item) => (
              <div key={item._id} className={`p-3 border rounded-xl flex items-center justify-between gap-4 ${item.mandatory ? 'border-red-500/30 bg-red-500/5' : 'border-[var(--color-border)]'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)] w-6 text-center">{item.order}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[var(--color-text-primary)]">{item.skillGroupName}</span>
                      {item.mandatory && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Mandatory</span>}
                    </div>
                    <span className="text-[10px] text-[var(--color-text-muted)]">{item.contentBlocks?.length ?? 0} blocks</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditTarget(item); setShowForm(false); }} className="px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]">Edit</button>
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
