import { useState, useEffect, useRef } from 'react';
import adminResumeTemplatesService   from '../../services/admin/resumeTemplates.service';
import adminGuideSectionsService     from '../../services/admin/resumeGuideSections.service';
import adminResumeReferencesService  from '../../services/admin/resumeReferences.service';
import adminAtsLinksService          from '../../services/admin/atsCheckerLinks.service';
import adminImprovementService       from '../../services/admin/resumeImprovementResources.service';
import ContentBlockEditor            from '../../components/shared/ContentBlockEditor';
import ContentBlockRenderer          from '../../components/shared/ContentBlockRenderer';
import api                           from '../../services/api';

// ─── Shared helper components ─────────────────────────────────────────────────
const Toast = ({ msg, type }) => msg ? (
  <div className={`px-4 py-3 rounded-xl text-xs font-semibold animate-fade-in border ${
    type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
  }`}>{msg}</div>
) : null;

function SectionInput({ label, id, value, onChange, placeholder, type = 'text', textarea = false }) {
  const cls = "w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none focus:border-red-500";
  return (
    <div>
      <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">{label}</label>
      {textarea
        ? <textarea id={id} rows={3} value={value} onChange={onChange} placeholder={placeholder} className={`${cls} resize-none`} />
        : <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} className={cls} />
      }
    </div>
  );
}

const TABS = [
  { id: 'templates',    label: '📄 Templates' },
  { id: 'guide',        label: '🏗️ Building Guide' },
  { id: 'references',   label: '📚 References' },
  { id: 'ats',          label: '🔍 ATS Checkers' },
  { id: 'improvement',  label: '💡 Improvement' },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  TAB 1 — RESUME TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════
function TemplatesTab({ toast }) {
  const [items,  setItems]  = useState([]);
  const [form,   setForm]   = useState({ title: '', description: '', category: 'general', fileUrl: '', fileType: 'docx', previewImageUrl: '', order: 0 });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ file: false, preview: false });
  const fileRef    = useRef(null);
  const previewRef = useRef(null);
  const tempId = useRef(Date.now().toString());

  const load = () => adminResumeTemplatesService.getAll().then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(p => ({ ...p, file: true }));
    try {
      const fd = new FormData();
      fd.append('file', file);
      const result = await adminResumeTemplatesService.uploadFile(fd, editId || tempId.current);
      setForm(p => ({ ...p, fileUrl: result.fileUrl, fileType: result.fileType || 'docx' }));
      toast('Template file uploaded.', 'success');
    } catch (e) {
      toast(e.response?.data?.message || 'File upload failed.', 'error');
    } finally { setUploading(p => ({ ...p, file: false })); }
  };

  const handlePreviewUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(p => ({ ...p, preview: true }));
    try {
      const fd = new FormData();
      fd.append('image', file);
      const result = await adminResumeTemplatesService.uploadPreview(fd, editId || tempId.current);
      setForm(p => ({ ...p, previewImageUrl: result.fileUrl }));
      toast('Preview image uploaded.', 'success');
    } catch (e) {
      toast(e.response?.data?.message || 'Preview upload failed.', 'error');
    } finally { setUploading(p => ({ ...p, preview: false })); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast('Title is required.', 'error'); return; }
    if (!form.fileUrl)      { toast('Please upload a template file first.', 'error'); return; }
    setSaving(true);
    try {
      if (editId) {
        await adminResumeTemplatesService.update(editId, form);
        toast('Template updated.', 'success');
      } else {
        await adminResumeTemplatesService.create(form);
        toast('Template created.', 'success');
        tempId.current = Date.now().toString();
      }
      setForm({ title: '', description: '', category: 'general', fileUrl: '', fileType: 'docx', previewImageUrl: '', order: 0 });
      setEditId(null);
      load();
    } catch (e) { toast(e.response?.data?.message || 'Save failed.', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this template?')) return;
    await adminResumeTemplatesService.remove(id).catch(() => {});
    load();
    toast('Template deleted.', 'success');
  };

  const startEdit = (item) => {
    setEditId(item._id);
    setForm({ title: item.title, description: item.description || '', category: item.category || 'general', fileUrl: item.fileUrl, fileType: item.fileType || 'docx', previewImageUrl: item.previewImageUrl || '', order: item.order || 0 });
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSave} className="glass-card p-5 border border-[var(--color-border)] flex flex-col gap-4">
        <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wider">
          {editId ? '✏️ Edit Template' : '+ Add Template'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SectionInput label="Template Title *" id="tmpl-title" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="ATS-Friendly Fresher Resume" />
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Category</label>
            <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none focus:border-red-500">
              {['fresher','experienced','internship','general'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <SectionInput label="Description" id="tmpl-desc" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="One-page ATS-friendly template..." textarea />
          <SectionInput label="Display Order" id="tmpl-order" value={form.order} onChange={e => setForm(p => ({...p, order: e.target.value}))} type="number" placeholder="0" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Template File */}
          <div className="border border-[var(--color-border)] rounded-xl p-4 flex flex-col gap-2">
            <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Template File (.docx / .pdf) *</p>
            {form.fileUrl && <p className="text-[10px] text-emerald-400 font-bold truncate">✓ {form.fileUrl.split('/').pop()}</p>}
            <input ref={fileRef} type="file" accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileUpload} className="hidden" />
            <button type="button" disabled={uploading.file} onClick={() => fileRef.current?.click()} className="px-3 py-2 bg-red-500/10 text-red-500 text-[10px] font-bold rounded-lg hover:bg-red-500/20 disabled:opacity-50 transition-all">
              {uploading.file ? 'Uploading…' : form.fileUrl ? 'Change File' : '↑ Upload Template File'}
            </button>
          </div>

          {/* Preview Image */}
          <div className="border border-[var(--color-border)] rounded-xl p-4 flex flex-col gap-2">
            <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Preview Image (optional)</p>
            {form.previewImageUrl && <img src={form.previewImageUrl} alt="preview" className="w-16 h-20 object-cover rounded-lg border border-[var(--color-border)]" />}
            <input ref={previewRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePreviewUpload} className="hidden" />
            <button type="button" disabled={uploading.preview} onClick={() => previewRef.current?.click()} className="px-3 py-2 bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] text-[10px] font-bold rounded-lg hover:bg-[var(--color-border)] disabled:opacity-50 transition-all">
              {uploading.preview ? 'Uploading…' : form.previewImageUrl ? 'Change Image' : '↑ Upload Preview'}
            </button>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={saving} id="tmpl-save-btn" className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg disabled:opacity-50 transition-all">
            {saving ? 'Saving…' : editId ? 'Update Template' : 'Add Template'}
          </button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm({ title: '', description: '', category: 'general', fileUrl: '', fileType: 'docx', previewImageUrl: '', order: 0 }); }} className="px-4 py-2 border border-[var(--color-border)] text-xs font-bold rounded-lg text-[var(--color-text-secondary)] hover:border-red-500/30">Cancel</button>}
        </div>
      </form>

      {/* List */}
      <div className="overflow-x-auto border border-[var(--color-border)] rounded-xl">
        <table className="w-full text-xs text-left min-w-[600px] border-collapse">
          <thead className="bg-[var(--color-bg-secondary)]/30 text-[var(--color-text-muted)] font-bold border-b border-[var(--color-border)]">
            <tr><th className="p-3 w-16">Preview</th><th className="p-3">Title</th><th className="p-3 w-28">Category</th><th className="p-3 w-28">File</th><th className="p-3 text-center w-24">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]/50 bg-[var(--color-surface)]">
            {items.length > 0 ? items.map(item => (
              <tr key={item._id} className="hover:bg-[var(--color-bg-secondary)]/10 transition-colors">
                <td className="p-3">
                  {item.previewImageUrl
                    ? <img src={item.previewImageUrl} alt={item.title} className="w-10 h-12 object-cover rounded-lg border border-[var(--color-border)]" />
                    : <div className="w-10 h-12 bg-[var(--color-bg-secondary)] rounded-lg flex items-center justify-center text-[var(--color-text-muted)] text-lg">📄</div>
                  }
                </td>
                <td className="p-3 font-bold text-[var(--color-text-primary)] max-w-[200px]">
                  <div className="truncate">{item.title}</div>
                  {item.description && <div className="text-[10px] font-normal text-[var(--color-text-muted)] truncate mt-0.5">{item.description}</div>}
                </td>
                <td className="p-3"><span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]">{item.category}</span></td>
                <td className="p-3 font-mono text-[10px] text-[var(--color-accent)]">{item.fileType?.toUpperCase()}</td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => startEdit(item)} className="text-[10px] font-bold text-[var(--color-accent)] border border-[var(--color-accent)]/30 px-2 py-1 rounded hover:bg-[var(--color-accent)]/10 transition-all">Edit</button>
                    <button onClick={() => handleDelete(item._id)} className="text-[10px] font-bold text-red-400 hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="p-6 text-center text-[var(--color-text-muted)] italic">No templates yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TAB 2 — BUILDING GUIDE SECTIONS (drag-reorder)
// ═══════════════════════════════════════════════════════════════════════════════
function GuideSectionsTab({ toast }) {
  const [sections, setSections]   = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [addForm,  setAddForm]    = useState({ sectionTitle: '', isRequired: true, contentBlocks: [] });
  const [editForm, setEditForm]   = useState(null);
  const [saving, setSaving]       = useState(false);
  const [dragIdx, setDragIdx]     = useState(null);

  const load = () => adminGuideSectionsService.getAll().then(setSections).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addForm.sectionTitle.trim()) { toast('Section title required.', 'error'); return; }
    setSaving(true);
    try {
      const nextOrder = sections.length > 0 ? Math.max(...sections.map(s => s.sectionOrder)) + 1 : 0;
      await adminGuideSectionsService.create({ ...addForm, sectionOrder: nextOrder });
      setAddForm({ sectionTitle: '', isRequired: true, contentBlocks: [] });
      load(); toast('Section added.', 'success');
    } catch (e) { toast(e.response?.data?.message || 'Failed.', 'error'); }
    finally { setSaving(false); }
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      await adminGuideSectionsService.update(editingId, editForm);
      setEditingId(null); setEditForm(null);
      load(); toast('Section updated.', 'success');
    } catch (e) { toast(e.response?.data?.message || 'Failed.', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this section?')) return;
    await adminGuideSectionsService.remove(id).catch(() => {});
    load(); toast('Section deleted.', 'success');
  };

  // Drag-and-drop reorder
  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDrop = async (dropIdx) => {
    if (dragIdx === null || dragIdx === dropIdx) return;
    const reordered = [...sections];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(dropIdx, 0, moved);
    const items = reordered.map((s, i) => ({ id: s._id, sectionOrder: i }));
    setSections(reordered.map((s, i) => ({ ...s, sectionOrder: i })));
    setDragIdx(null);
    try {
      await adminGuideSectionsService.reorder(items);
      toast('Sections reordered.', 'success');
    } catch { toast('Reorder failed.', 'error'); load(); }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Add form */}
      <form onSubmit={handleAdd} className="glass-card p-5 border border-[var(--color-border)] flex flex-col gap-4">
        <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wider">+ Add Guide Section</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SectionInput label="Section Title *" id="sec-title" value={addForm.sectionTitle} onChange={e => setAddForm(p => ({...p, sectionTitle: e.target.value}))} placeholder="e.g. Education Section" />
          <div className="flex items-center gap-3 pt-5">
            <input type="checkbox" id="sec-required" checked={addForm.isRequired} onChange={e => setAddForm(p => ({...p, isRequired: e.target.checked}))} className="w-4 h-4" />
            <label htmlFor="sec-required" className="text-xs font-bold text-[var(--color-text-secondary)] cursor-pointer">Mark as Required Section</label>
          </div>
        </div>
        <div>
          <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-2">Section Content (optional — add via editor)</label>
          <ContentBlockEditor blocks={addForm.contentBlocks} onChange={blocks => setAddForm(p => ({...p, contentBlocks: blocks}))} />
        </div>
        <button type="submit" disabled={saving} id="sec-add-btn" className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg w-fit disabled:opacity-50 transition-all">
          {saving ? 'Adding…' : 'Add Section'}
        </button>
      </form>

      {/* Sections list (drag-reorderable) */}
      <div className="flex flex-col gap-3">
        <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">Drag rows to reorder — the order here is the "correct resume structure" shown to students</p>
        {sections.map((sec, idx) => (
          <div
            key={sec._id}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(idx)}
            className="glass-card border border-[var(--color-border)] hover:border-red-500/20 transition-all"
          >
            {editingId === sec._id && editForm ? (
              <div className="p-5 flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SectionInput label="Section Title" id="edit-sec-title" value={editForm.sectionTitle} onChange={e => setEditForm(p => ({...p, sectionTitle: e.target.value}))} placeholder="Section title" />
                  <div className="flex items-center gap-3 pt-5">
                    <input type="checkbox" checked={editForm.isRequired} onChange={e => setEditForm(p => ({...p, isRequired: e.target.checked}))} className="w-4 h-4" />
                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">Required Section</span>
                  </div>
                </div>
                <ContentBlockEditor blocks={editForm.contentBlocks || []} onChange={blocks => setEditForm(p => ({...p, contentBlocks: blocks}))} />
                <div className="flex gap-2">
                  <button onClick={handleEditSave} disabled={saving} className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-lg disabled:opacity-50 transition-all">{saving ? 'Saving…' : 'Save'}</button>
                  <button onClick={() => { setEditingId(null); setEditForm(null); }} className="px-4 py-2 border border-[var(--color-border)] text-xs font-bold rounded-lg text-[var(--color-text-secondary)]">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4">
                <span className="text-[var(--color-text-muted)] cursor-grab text-xl">⋮⋮</span>
                <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 font-black text-[10px] flex items-center justify-center flex-shrink-0">{idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-[var(--color-text-primary)] truncate block">{sec.sectionTitle}</span>
                  <span className={`text-[9px] font-bold ${sec.isRequired ? 'text-red-400' : 'text-[var(--color-text-muted)]'}`}>{sec.isRequired ? '● Required' : '○ Optional'}</span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => { setEditingId(sec._id); setEditForm({ sectionTitle: sec.sectionTitle, isRequired: sec.isRequired, contentBlocks: sec.contentBlocks || [] }); }} className="text-[10px] font-bold text-[var(--color-accent)] border border-[var(--color-accent)]/30 px-2 py-1 rounded hover:bg-[var(--color-accent)]/10 transition-all">Edit</button>
                  <button onClick={() => handleDelete(sec._id)} className="text-[10px] font-bold text-red-400 hover:underline">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {sections.length === 0 && <p className="text-center text-xs text-[var(--color-text-muted)] py-8 italic">No guide sections yet. Add one above.</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TAB 3 — REFERENCES
// ═══════════════════════════════════════════════════════════════════════════════
function ReferencesTab({ toast }) {
  const [items, setItems]   = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm]     = useState({ title: '', description: '', category: '', contentBlocks: [], order: 0 });
  const [saving, setSaving] = useState(false);

  const load = () => adminResumeReferencesService.getAll().then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast('Title is required.', 'error'); return; }
    setSaving(true);
    try {
      if (editId) { await adminResumeReferencesService.update(editId, form); toast('Reference updated.', 'success'); }
      else        { await adminResumeReferencesService.create(form);         toast('Reference created.', 'success'); }
      setForm({ title: '', description: '', category: '', contentBlocks: [], order: 0 });
      setEditId(null); load();
    } catch (e) { toast(e.response?.data?.message || 'Save failed.', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reference?')) return;
    await adminResumeReferencesService.remove(id).catch(() => {});
    load(); toast('Reference deleted.', 'success');
  };

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSave} className="glass-card p-5 border border-[var(--color-border)] flex flex-col gap-4">
        <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wider">{editId ? '✏️ Edit Reference' : '+ Add Reference'}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SectionInput label="Title *" id="ref-title" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="CSE Fresher Resume Example" />
          <SectionInput label="Category (free text)" id="ref-cat" value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} placeholder="e.g. CSE / Software Dev" />
          <SectionInput label="Description" id="ref-desc" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Brief description…" textarea />
          <SectionInput label="Order" id="ref-order" value={form.order} onChange={e => setForm(p => ({...p, order: e.target.value}))} type="number" placeholder="0" />
        </div>
        <div>
          <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-2">Content (links, images, PDF embeds, etc.)</label>
          <ContentBlockEditor blocks={form.contentBlocks} onChange={blocks => setForm(p => ({...p, contentBlocks: blocks}))} />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={saving} className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg disabled:opacity-50 transition-all">{saving ? 'Saving…' : editId ? 'Update' : 'Add Reference'}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm({ title: '', description: '', category: '', contentBlocks: [], order: 0 }); }} className="px-4 py-2 border border-[var(--color-border)] text-xs font-bold rounded-lg text-[var(--color-text-secondary)]">Cancel</button>}
        </div>
      </form>
      <div className="flex flex-col gap-3">
        {items.map(item => (
          <div key={item._id} className="glass-card p-4 border border-[var(--color-border)] flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[var(--color-text-primary)]">{item.title}</p>
              {item.category && <span className="text-[9px] font-bold text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-0.5 rounded-full inline-block mt-0.5">{item.category}</span>}
              {item.description && <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{item.description}</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => { setEditId(item._id); setForm({ title: item.title, description: item.description || '', category: item.category || '', contentBlocks: item.contentBlocks || [], order: item.order || 0 }); }} className="text-[10px] font-bold text-[var(--color-accent)] border border-[var(--color-accent)]/30 px-2 py-1 rounded hover:bg-[var(--color-accent)]/10 transition-all">Edit</button>
              <button onClick={() => handleDelete(item._id)} className="text-[10px] font-bold text-red-400 hover:underline">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-xs text-[var(--color-text-muted)] py-8 italic">No references yet.</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TAB 4 — ATS CHECKER LINKS (simple — no content blocks)
// ═══════════════════════════════════════════════════════════════════════════════
function AtsLinksTab({ toast }) {
  const [items, setItems]   = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm]     = useState({ name: '', description: '', url: '', order: 0 });
  const [saving, setSaving] = useState(false);

  const load = () => adminAtsLinksService.getAll().then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.url.trim()) { toast('Name and URL are required.', 'error'); return; }
    setSaving(true);
    try {
      if (editId) { await adminAtsLinksService.update(editId, form); toast('ATS link updated.', 'success'); }
      else        { await adminAtsLinksService.create(form);         toast('ATS link added.', 'success'); }
      setForm({ name: '', description: '', url: '', order: 0 }); setEditId(null); load();
    } catch (e) { toast(e.response?.data?.message || 'Save failed.', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ATS link?')) return;
    await adminAtsLinksService.remove(id).catch(() => {});
    load(); toast('Deleted.', 'success');
  };

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSave} className="glass-card p-5 border border-[var(--color-border)] flex flex-col gap-4">
        <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wider">{editId ? '✏️ Edit ATS Link' : '+ Add ATS Checker Link'}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SectionInput label="Tool Name *" id="ats-name" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Jobscan" />
          <SectionInput label="URL *" id="ats-url" value={form.url} onChange={e => setForm(p => ({...p, url: e.target.value}))} placeholder="https://www.jobscan.co" />
          <SectionInput label="Description (one line)" id="ats-desc" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Checks your resume against job descriptions" />
          <SectionInput label="Display Order" id="ats-order" value={form.order} onChange={e => setForm(p => ({...p, order: e.target.value}))} type="number" />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={saving} className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg disabled:opacity-50 transition-all">{saving ? 'Saving…' : editId ? 'Update' : 'Add Link'}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm({ name: '', description: '', url: '', order: 0 }); }} className="px-4 py-2 border border-[var(--color-border)] text-xs font-bold rounded-lg text-[var(--color-text-secondary)]">Cancel</button>}
        </div>
      </form>
      <div className="flex flex-col gap-2">
        {items.map(item => (
          <div key={item._id} className="flex items-center gap-4 p-4 glass-card border border-[var(--color-border)]">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[var(--color-text-primary)]">{item.name}</p>
              {item.description && <p className="text-[10px] text-[var(--color-text-muted)]">{item.description}</p>}
              <a href={item.url} target="_blank" rel="noreferrer" className="text-[10px] text-[var(--color-accent)] hover:underline truncate block">{item.url}</a>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => { setEditId(item._id); setForm({ name: item.name, description: item.description || '', url: item.url, order: item.order || 0 }); }} className="text-[10px] font-bold text-[var(--color-accent)] border border-[var(--color-accent)]/30 px-2 py-1 rounded hover:bg-[var(--color-accent)]/10 transition-all">Edit</button>
              <button onClick={() => handleDelete(item._id)} className="text-[10px] font-bold text-red-400 hover:underline">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-xs text-[var(--color-text-muted)] py-8 italic">No ATS links yet.</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TAB 5 — IMPROVEMENT RESOURCES
// ═══════════════════════════════════════════════════════════════════════════════
function ImprovementTab({ toast }) {
  const [items, setItems]   = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm]     = useState({ title: '', contentBlocks: [], order: 0 });
  const [saving, setSaving] = useState(false);

  const load = () => adminImprovementService.getAll().then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast('Title is required.', 'error'); return; }
    setSaving(true);
    try {
      if (editId) { await adminImprovementService.update(editId, form); toast('Resource updated.', 'success'); }
      else        { await adminImprovementService.create(form);         toast('Resource created.', 'success'); }
      setForm({ title: '', contentBlocks: [], order: 0 }); setEditId(null); load();
    } catch (e) { toast(e.response?.data?.message || 'Save failed.', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    await adminImprovementService.remove(id).catch(() => {});
    load(); toast('Deleted.', 'success');
  };

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSave} className="glass-card p-5 border border-[var(--color-border)] flex flex-col gap-4">
        <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wider">{editId ? '✏️ Edit Resource' : '+ Add Improvement Resource'}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SectionInput label="Title *" id="impr-title" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="How to Write a Strong Summary" />
          <SectionInput label="Display Order" id="impr-order" value={form.order} onChange={e => setForm(p => ({...p, order: e.target.value}))} type="number" />
        </div>
        <div>
          <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-2">Content (tips, videos, article links, etc.)</label>
          <ContentBlockEditor blocks={form.contentBlocks} onChange={blocks => setForm(p => ({...p, contentBlocks: blocks}))} />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={saving} className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg disabled:opacity-50 transition-all">{saving ? 'Saving…' : editId ? 'Update' : 'Add Resource'}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm({ title: '', contentBlocks: [], order: 0 }); }} className="px-4 py-2 border border-[var(--color-border)] text-xs font-bold rounded-lg text-[var(--color-text-secondary)]">Cancel</button>}
        </div>
      </form>
      <div className="flex flex-col gap-3">
        {items.map(item => (
          <div key={item._id} className="glass-card p-4 border border-[var(--color-border)] flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[var(--color-text-primary)]">💡 {item.title}</p>
              {item.contentBlocks?.length > 0 && <div className="mt-2"><ContentBlockRenderer blocks={item.contentBlocks.slice(0, 1)} /></div>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => { setEditId(item._id); setForm({ title: item.title, contentBlocks: item.contentBlocks || [], order: item.order || 0 }); }} className="text-[10px] font-bold text-[var(--color-accent)] border border-[var(--color-accent)]/30 px-2 py-1 rounded hover:bg-[var(--color-accent)]/10 transition-all">Edit</button>
              <button onClick={() => handleDelete(item._id)} className="text-[10px] font-bold text-red-400 hover:underline">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-xs text-[var(--color-text-muted)] py-8 italic">No resources yet.</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ROOT PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ManageResumeGuide() {
  const [activeTab, setActiveTab] = useState('templates');
  const [toastMsg, setToastMsg]   = useState(null);
  const [toastType, setToastType] = useState('success');

  const toast = (msg, type = 'success') => {
    setToastMsg(msg); setToastType(type);
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Manage Resume Guide</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          5 dedicated sections — Templates, Building Guide, References, ATS Checkers, Improvement Resources
        </p>
      </div>

      <Toast msg={toastMsg} type={toastType} />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--color-border)]">
        {TABS.map(tab => (
          <button
            key={tab.id}
            id={`admin-resume-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg border border-b-0 border-transparent transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--color-surface)] border-[var(--color-border)] text-red-500 -mb-px'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'templates'   && <TemplatesTab     toast={toast} />}
      {activeTab === 'guide'       && <GuideSectionsTab toast={toast} />}
      {activeTab === 'references'  && <ReferencesTab    toast={toast} />}
      {activeTab === 'ats'         && <AtsLinksTab       toast={toast} />}
      {activeTab === 'improvement' && <ImprovementTab   toast={toast} />}
    </div>
  );
}
