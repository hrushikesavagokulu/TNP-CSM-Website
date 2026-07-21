import { useState, useEffect, useRef } from 'react';
import departmentInfoService from '../../services/admin/departmentInfo.service';
import FileUploader from '../../components/shared/FileUploader';
import api from '../../services/api';

// ─── Inline Faculty Edit Modal ────────────────────────────────────────────────
function FacultyEditModal({ faculty, onClose, onSaved }) {
  const [form, setForm]         = useState({ ...faculty });
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoErr, setPhotoErr] = useState(null);
  const [err, setErr]           = useState(null);
  const fileRef = useRef(null);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoErr(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post(
        `/admin/department-info/upload-faculty-photo?facultyId=${faculty._id}`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const url = res.data?.data?.fileUrl || res.data?.fileUrl;
      if (url) setForm((p) => ({ ...p, imageUrl: url }));
      else setPhotoErr('Upload returned no URL.');
    } catch (e) {
      setPhotoErr(e.response?.data?.message || 'Photo upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.designation?.trim()) {
      setErr('Name and Designation are required.');
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const updated = await departmentInfoService.updateFacultyLink(faculty._id, {
        name: form.name,
        designation: form.designation,
        qualifications: form.qualifications,
        researchInterest: form.researchInterest,
        googleScholar: form.googleScholar,
        apaarId: form.apaarId,
        vidwanProfile: form.vidwanProfile,
        email: form.email,
        isGuest: !!form.isGuest,
        imageUrl: form.imageUrl,
      });
      onSaved(updated);
    } catch (e) {
      setErr(e.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, id, value, onChange, placeholder, type = 'text' }) => (
    <div>
      <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none focus:border-red-500"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col border border-[var(--color-border)] shadow-2xl rounded-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-base font-black text-[var(--color-text-primary)]">Edit Faculty Profile</h2>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{faculty.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 text-xl transition-all">✕</button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-5 p-6">
          {err && <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">⚠ {err}</div>}

          {/* Profile Photo */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-bg-secondary)]/40 border border-[var(--color-border)]">
            <div className="relative flex-shrink-0">
              {form.imageUrl ? (
                <img src={form.imageUrl} alt={form.name} className="w-20 h-20 rounded-full object-cover border-2 border-[var(--color-accent)]" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/30 flex items-center justify-center text-2xl font-black text-red-500 border-2 border-[var(--color-border)]">
                  {form.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">...</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[var(--color-text-primary)] mb-1">Profile Photo</p>
              <p className="text-[10px] text-[var(--color-text-muted)] mb-2">Upload JPG / PNG / WebP · Max 2MB</p>
              {photoErr && <p className="text-[10px] text-red-400 mb-1">⚠ {photoErr}</p>}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="px-3 py-1.5 bg-[var(--color-accent)] text-white text-[10px] font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {uploading ? 'Uploading…' : form.imageUrl ? 'Change Photo' : 'Upload Photo'}
              </button>
              {form.imageUrl && (
                <button type="button" onClick={() => setForm((p) => ({ ...p, imageUrl: '' }))} className="ml-2 px-3 py-1.5 text-red-400 text-[10px] font-bold hover:underline">
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name *" id="edit-fac-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Dr. R. Praveen Sam" />
            <Field label="Designation / Role *" id="edit-fac-designation" value={form.designation} onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))} placeholder="Professor & HoD" />
            <Field label="Qualifications" id="edit-fac-qualifications" value={form.qualifications} onChange={(e) => setForm((p) => ({ ...p, qualifications: e.target.value }))} placeholder="Ph.D" />
            <Field label="Contact Email" id="edit-fac-email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="email@gprec.ac.in" type="email" />
            <Field label="Research Interest" id="edit-fac-research" value={form.researchInterest} onChange={(e) => setForm((p) => ({ ...p, researchInterest: e.target.value }))} placeholder="Computer Networks, AI" />
            <Field label="Google Scholar URL" id="edit-fac-scholar" value={form.googleScholar} onChange={(e) => setForm((p) => ({ ...p, googleScholar: e.target.value }))} placeholder="https://scholar.google.com/..." />
            <Field label="APAAR ID" id="edit-fac-apaar" value={form.apaarId} onChange={(e) => setForm((p) => ({ ...p, apaarId: e.target.value }))} placeholder="811167259826" />
            <Field label="Vidwan Profile URL" id="edit-fac-vidwan" value={form.vidwanProfile} onChange={(e) => setForm((p) => ({ ...p, vidwanProfile: e.target.value }))} placeholder="https://vidwan.inflibnet.ac.in/..." />
          </div>

          {/* Guest toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!form.isGuest}
              onChange={(e) => setForm((p) => ({ ...p, isGuest: e.target.checked }))}
              className="w-4 h-4 rounded text-red-500 border-[var(--color-border)]"
            />
            <span className="text-xs font-bold text-[var(--color-text-secondary)]">Mark as Guest Faculty</span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--color-border)]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-lg hover:border-red-500/30 transition-all">Cancel</button>
            <button type="submit" disabled={saving} id="edit-faculty-save-btn" className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg disabled:opacity-50 transition-all">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ManageDepartmentInfo() {
  const [motto,   setMotto]   = useState('');
  const [vision,  setVision]  = useState('');
  const [mission, setMission] = useState('');
  const [heroUrl, setHeroUrl] = useState('');

  const [facultyList, setFacultyList] = useState([]);
  const [facForm, setFacForm] = useState({
    name: '', designation: '', qualifications: '', researchInterest: '',
    googleScholar: '', apaarId: '', vidwanProfile: '', email: '',
    isGuest: false, imageUrl: '',
  });

  const [schemeList, setSchemeList] = useState([]);
  const [schForm, setSchForm]       = useState({ schemeYear: '', title: '', url: '' });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingFaculty, setEditingFaculty] = useState(null); // faculty object being edited

  // For new-faculty photo upload
  const [newFacUploading, setNewFacUploading] = useState(false);
  const newFacPhotoRef = useRef(null);

  // ── Load all ───────────────────────────────────────────────────────────────
  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const info = await departmentInfoService.getDepartmentInfo();
      setMotto(info?.motto || '');
      setVision(info?.vision || '');
      setMission(info?.mission || '');
      setHeroUrl(info?.heroImageUrl || '');

      const facs = await departmentInfoService.getFacultyLinks();
      setFacultyList(facs || []);

      const schs = await departmentInfoService.getSchemeLinks();
      setSchemeList(schs || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve department info.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  // ── Save vision/motto/mission ──────────────────────────────────────────────
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    try {
      await departmentInfoService.updateDepartmentInfo({ motto, vision, mission });
      setSuccess('Department vision, motto, and mission updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update department text fields.');
    }
  };

  // ── Hero Banner upload complete ────────────────────────────────────────────
  // FileUploader calls onUploadComplete(uploadedUrl, responseData)
  // We receive the URL string as first arg (not an object)
  const handleHeroComplete = (uploadedUrl, responseData) => {
    const url = uploadedUrl || responseData?.fileUrl || responseData?.url;
    if (!url) {
      setError('Banner upload completed but no URL was returned.');
      return;
    }
    setHeroUrl(url);
    setSuccess('Hero banner uploaded successfully.');
    // Persist the URL to the department info singleton
    departmentInfoService
      .updateDepartmentInfo({ heroImageUrl: url })
      .catch(() => {}); // silent — hero URL is stored locally too
  };

  // ── New-faculty photo upload ────────────────────────────────────────────────
  const handleNewFacPhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewFacUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/admin/department-info/upload-faculty-photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.data?.fileUrl || res.data?.fileUrl;
      if (url) {
        setFacForm((p) => ({ ...p, imageUrl: url }));
        setSuccess('Faculty photo uploaded successfully.');
      } else {
        setError('Photo upload returned no URL.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload faculty photo.');
    } finally {
      setNewFacUploading(false);
    }
  };

  // ── Faculty CRUD ───────────────────────────────────────────────────────────
  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    const { name, designation } = facForm;
    if (!name.trim() || !designation.trim()) { setError('Name and Designation are required.'); return; }
    try {
      const nextOrder = facultyList.length > 0 ? Math.max(...facultyList.map((f) => f.order || 0)) + 1 : 0;
      await departmentInfoService.createFacultyLink({ ...facForm, order: nextOrder });
      setFacForm({ name: '', designation: '', qualifications: '', researchInterest: '', googleScholar: '', apaarId: '', vidwanProfile: '', email: '', isGuest: false, imageUrl: '' });
      loadAll();
      setSuccess('Faculty profile created successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create faculty profile.');
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (!window.confirm('Delete this faculty profile? This cannot be undone.')) return;
    setError(null);
    try {
      await departmentInfoService.deleteFacultyLink(id);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete faculty profile.');
    }
  };

  const handleMoveFaculty = async (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= facultyList.length) return;
    const list = [...facultyList];
    const tempOrder = list[index].order;
    list[index].order = list[targetIdx].order;
    list[targetIdx].order = tempOrder;
    try {
      await departmentInfoService.updateFacultyLink(list[index]._id, { order: list[index].order });
      await departmentInfoService.updateFacultyLink(list[targetIdx]._id, { order: list[targetIdx].order });
      loadAll();
    } catch { setError('Failed to reorder faculty.'); }
  };

  const handleFacultyEditSaved = (updatedFaculty) => {
    setFacultyList((prev) => prev.map((f) => (f._id === updatedFaculty._id ? updatedFaculty : f)));
    setEditingFaculty(null);
    setSuccess('Faculty profile updated successfully.');
  };

  // ── Scheme CRUD ─────────────────────────────────────────────────────────────
  const handleCreateScheme = async (e) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    const { schemeYear, title, url } = schForm;
    if (!schemeYear.trim() || !title.trim() || !url.trim()) { setError('Please fill all scheme fields.'); return; }
    try {
      const nextOrder = schemeList.length > 0 ? Math.max(...schemeList.map((s) => s.order || 0)) + 1 : 0;
      await departmentInfoService.createSchemeLink({ ...schForm, order: nextOrder });
      setSchForm({ schemeYear: '', title: '', url: '' });
      loadAll();
      setSuccess('Syllabus scheme created successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create scheme link.');
    }
  };

  const handleDeleteScheme = async (id) => {
    if (!window.confirm('Delete this syllabus card?')) return;
    try {
      await departmentInfoService.deleteSchemeLink(id);
      loadAll();
    } catch (err) { setError(err.response?.data?.message || 'Failed to delete scheme link.'); }
  };

  const handleMoveScheme = async (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= schemeList.length) return;
    const list = [...schemeList];
    const tempOrder = list[index].order;
    list[index].order = list[targetIdx].order;
    list[targetIdx].order = tempOrder;
    try {
      await departmentInfoService.updateSchemeLink(list[index]._id, { order: list[index].order });
      await departmentInfoService.updateSchemeLink(list[targetIdx]._id, { order: list[targetIdx].order });
      loadAll();
    } catch { setError('Failed to reorder scheme links.'); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Manage Department Info</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">Configure vision, faculty profiles, hero banner, and syllabus scheme documents</p>
      </div>

      {/* Feedback */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 animate-fade-in">⚠ {error}</div>
      )}
      {success && (
        <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium animate-fade-in">✓ {success}</div>
      )}

      {/* ── Section 1: Vision / Motto / Mission + Hero Banner ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-4">Vision, Motto & Mission</h3>
          <form onSubmit={handleSaveInfo} className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Department Motto</label>
              <textarea id="dept-motto" rows={2} placeholder="CSM Department motto..." value={motto} onChange={(e) => setMotto(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none focus:border-red-500 resize-none" />
            </div>
            <div>
              <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Vision Statement</label>
              <textarea id="dept-vision" rows={3} placeholder="The department aims to become..." value={vision} onChange={(e) => setVision(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none focus:border-red-500 resize-none" />
            </div>
            <div>
              <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Mission Statement</label>
              <textarea id="dept-mission" rows={4} placeholder="M1: To facilitate competent students..." value={mission} onChange={(e) => setMission(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none focus:border-red-500 resize-none" />
            </div>
            <button id="dept-info-submit" type="submit" className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg w-fit transition-all">
              Save Vision Details
            </button>
          </form>
        </div>

        {/* Hero Banner */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Department Hero Banner</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
              Upload the homepage hero/banner image. Replaces the default public page background.
            </p>
          </div>

          <FileUploader
            uploadUrl="/admin/department-info/upload-hero-image"
            fieldName="image"
            accept="image/jpeg,image/png,image/webp"
            maxSizeMB={5}
            label="Drop banner image here"
            onUploadComplete={handleHeroComplete}
            currentUrl={heroUrl || undefined}
          />

          {heroUrl && (
            <div>
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] block mb-1.5">Active Banner Preview:</span>
              <img src={heroUrl} alt="Banner Preview" className="w-full h-28 object-cover rounded-xl border border-[var(--color-border)]" />
              <button
                type="button"
                className="mt-2 text-[10px] text-red-400 font-bold hover:underline"
                onClick={() => {
                  setHeroUrl('');
                  departmentInfoService.updateDepartmentInfo({ heroImageUrl: '' }).catch(() => {});
                }}
              >
                Remove Banner
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Section 2: Faculty Profile Directory ────────────────────────────── */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-1">Faculty Profile Directory</h3>
        <p className="text-xs text-[var(--color-text-secondary)] mb-5">Add, edit, reorder, or remove faculty profiles including photos and academic details.</p>

        {/* ─ Create Form */}
        <form onSubmit={handleCreateFaculty} className="border border-[var(--color-border)] rounded-xl p-4 mb-6 bg-[var(--color-bg-secondary)]/20">
          <h4 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wider mb-4">+ Add New Faculty Profile</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-3">
              {[
                { label: 'Faculty Name *', id: 'create-fac-name', key: 'name', placeholder: 'Dr. R. Praveen Sam' },
                { label: 'Designation *', id: 'create-fac-designation', key: 'designation', placeholder: 'Professor & HoD' },
                { label: 'Qualifications', id: 'create-fac-qualifications', key: 'qualifications', placeholder: 'Ph.D' },
              ].map(({ label, id, key, placeholder }) => (
                <div key={key}>
                  <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">{label}</label>
                  <input id={id} type="text" value={facForm[key]} placeholder={placeholder}
                    onChange={(e) => setFacForm((p) => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none focus:border-red-500" />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {[
                { label: 'Research Interest', id: 'create-fac-research', key: 'researchInterest', placeholder: 'Computer Networks' },
                { label: 'Google Scholar URL', id: 'create-fac-scholar', key: 'googleScholar', placeholder: 'https://scholar.google.com/...' },
                { label: 'APAAR ID', id: 'create-fac-apaar', key: 'apaarId', placeholder: '811167259826' },
              ].map(({ label, id, key, placeholder }) => (
                <div key={key}>
                  <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">{label}</label>
                  <input id={id} type="text" value={facForm[key]} placeholder={placeholder}
                    onChange={(e) => setFacForm((p) => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none focus:border-red-500" />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Vidwan Profile URL</label>
                <input id="create-fac-vidwan" type="text" value={facForm.vidwanProfile} placeholder="https://vidwan.inflibnet.ac.in/..."
                  onChange={(e) => setFacForm((p) => ({ ...p, vidwanProfile: e.target.value }))}
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Contact Email</label>
                <input id="create-fac-email" type="email" value={facForm.email} placeholder="email@gprec.ac.in"
                  onChange={(e) => setFacForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none focus:border-red-500" />
              </div>

              {/* Profile photo for new faculty */}
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Profile Photo</label>
                <div className="flex items-center gap-3">
                  {facForm.imageUrl ? (
                    <img src={facForm.imageUrl} alt="Preview" className="w-10 h-10 rounded-full object-cover border-2 border-[var(--color-accent)] flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] text-xs flex-shrink-0">👤</div>
                  )}
                  <div className="flex flex-col gap-1">
                    <input ref={newFacPhotoRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleNewFacPhotoChange} className="hidden" />
                    <button type="button" disabled={newFacUploading} onClick={() => newFacPhotoRef.current?.click()}
                      className="px-2 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-[10px] font-bold rounded hover:bg-[var(--color-accent)]/20 transition-all disabled:opacity-50">
                      {newFacUploading ? 'Uploading…' : facForm.imageUrl ? 'Change' : 'Upload Photo'}
                    </button>
                    {facForm.imageUrl && (
                      <button type="button" onClick={() => setFacForm((p) => ({ ...p, imageUrl: '' }))} className="text-[10px] text-red-400 font-bold hover:underline">Remove</button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 flex items-center justify-between gap-4 mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input id="create-fac-guest" type="checkbox" checked={facForm.isGuest}
                  onChange={(e) => setFacForm((p) => ({ ...p, isGuest: e.target.checked }))}
                  className="w-4 h-4 rounded text-red-500 border-[var(--color-border)]" />
                <span className="text-xs font-bold text-[var(--color-text-secondary)]">Mark as Guest Faculty</span>
              </label>
              <button id="create-faculty-submit" type="submit" className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg transition-all">
                Add Faculty Profile
              </button>
            </div>
          </div>
        </form>

        {/* ─ Faculty List */}
        <div className="border border-[var(--color-border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-[var(--color-text-secondary)] border-collapse text-left min-w-[750px]">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/30 font-bold text-[var(--color-text-muted)]">
                  <th className="p-3 w-16 text-center">Photo</th>
                  <th className="p-3">Name</th>
                  <th className="p-3 w-44">Designation</th>
                  <th className="p-3 w-32">Qualifications</th>
                  <th className="p-3 w-28">Type</th>
                  <th className="p-3 text-center w-24">Reorder</th>
                  <th className="p-3 text-center w-14">Edit</th>
                  <th className="p-3 text-center w-16">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]/50 bg-[var(--color-surface)]">
                {loading ? (
                  <tr><td colSpan={8} className="p-6 text-center text-[var(--color-text-muted)] italic">Loading faculty...</td></tr>
                ) : facultyList.length > 0 ? (
                  facultyList.map((fac, index) => (
                    <tr key={fac._id} className="hover:bg-[var(--color-bg-secondary)]/20 transition-colors">
                      <td className="p-3 text-center">
                        {fac.imageUrl ? (
                          <img src={fac.imageUrl} alt={fac.name} className="w-9 h-9 rounded-full object-cover border border-[var(--color-border)] mx-auto" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center font-black text-sm mx-auto">
                            {fac.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-bold text-[var(--color-text-primary)] truncate max-w-[180px]">
                        <div>{fac.name}</div>
                        {fac.email && <div className="text-[10px] text-[var(--color-text-muted)] font-normal truncate">{fac.email}</div>}
                      </td>
                      <td className="p-3 truncate">{fac.designation}</td>
                      <td className="p-3 truncate">{fac.qualifications || '—'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${fac.isGuest ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-400'}`}>
                          {fac.isGuest ? 'Guest' : 'Regular'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleMoveFaculty(index, 'up')} disabled={index === 0}
                            className="p-1 border border-[var(--color-border)] hover:border-red-500/30 text-[var(--color-text-secondary)] hover:text-red-500 rounded disabled:opacity-30 transition-all">▲</button>
                          <button onClick={() => handleMoveFaculty(index, 'down')} disabled={index === facultyList.length - 1}
                            className="p-1 border border-[var(--color-border)] hover:border-red-500/30 text-[var(--color-text-secondary)] hover:text-red-500 rounded disabled:opacity-30 transition-all">▼</button>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setEditingFaculty(fac)}
                          className="px-2 py-1 text-[10px] font-bold text-[var(--color-accent)] border border-[var(--color-accent)]/30 rounded hover:bg-[var(--color-accent)]/10 transition-all"
                        >
                          Edit
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => handleDeleteFaculty(fac._id)}
                          className="text-red-400 hover:text-red-500 font-bold text-[10px] hover:underline transition-all">Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={8} className="p-6 text-center text-[var(--color-text-muted)] italic">No faculty profiles yet. Add one above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Section 3: Syllabus Schemes ─────────────────────────────────────── */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-1">Syllabus & Academic Schemes</h3>
        <p className="text-xs text-[var(--color-text-secondary)] mb-5">Add, reorder, or delete syllabus cards matching scheme years (e.g. Scheme-2020, Scheme-2023).</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleCreateScheme} className="flex flex-col gap-3">
            {[
              { label: 'Scheme Year (e.g. Scheme-2020)', id: 'create-scheme-year', key: 'schemeYear', placeholder: 'Scheme-2023' },
              { label: 'Card Title (e.g. SYLLABUS FOR II B.TECH)', id: 'create-scheme-title', key: 'title', placeholder: 'SYLLABUS FOR II B.TECH' },
              { label: 'Syllabus PDF Link', id: 'create-scheme-url', key: 'url', placeholder: 'https://www.gprec.ac.in/scheme-2023/...' },
            ].map(({ label, id, key, placeholder }) => (
              <div key={key}>
                <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">{label}</label>
                <input id={id} type="text" value={schForm[key]} placeholder={placeholder}
                  onChange={(e) => setSchForm((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none focus:border-red-500" />
              </div>
            ))}
            <button id="create-scheme-submit" type="submit" className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg w-fit mt-1 transition-all">
              Add Scheme Link
            </button>
          </form>

          <div className="lg:col-span-2 border border-[var(--color-border)] rounded-xl overflow-hidden">
            <table className="w-full text-xs text-[var(--color-text-secondary)] border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/30 font-bold text-[var(--color-text-muted)]">
                  <th className="p-3 w-32">Scheme Year</th>
                  <th className="p-3">Title</th>
                  <th className="p-3 text-center w-24">Reorder</th>
                  <th className="p-3 text-center w-16">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]/50 bg-[var(--color-surface)]">
                {schemeList.length > 0 ? (
                  schemeList.map((sch, index) => (
                    <tr key={sch._id} className="hover:bg-[var(--color-bg-secondary)]/10 transition-colors">
                      <td className="p-3 font-mono font-bold text-red-500 text-[10px]">{sch.schemeYear}</td>
                      <td className="p-3 truncate max-w-xs">
                        <a href={sch.url} target="_blank" rel="noreferrer" className="hover:underline text-[var(--color-text-primary)]">{sch.title}</a>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleMoveScheme(index, 'up')} disabled={index === 0}
                            className="p-1 border border-[var(--color-border)] hover:border-red-500/30 text-[var(--color-text-secondary)] hover:text-red-500 rounded disabled:opacity-30 transition-all">▲</button>
                          <button onClick={() => handleMoveScheme(index, 'down')} disabled={index === schemeList.length - 1}
                            className="p-1 border border-[var(--color-border)] hover:border-red-500/30 text-[var(--color-text-secondary)] hover:text-red-500 rounded disabled:opacity-30 transition-all">▼</button>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => handleDeleteScheme(sch._id)} className="text-red-400 hover:text-red-500 font-bold text-[10px] hover:underline transition-all">Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="p-6 text-center text-[var(--color-text-muted)] italic">No schemes added yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Faculty Modal */}
      {editingFaculty && (
        <FacultyEditModal
          faculty={editingFaculty}
          onClose={() => setEditingFaculty(null)}
          onSaved={handleFacultyEditSaved}
        />
      )}
    </div>
  );
}
