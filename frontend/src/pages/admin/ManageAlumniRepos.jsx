import { useState, useEffect, useCallback } from 'react';
import adminAlumniRepoService from '../../services/admin/alumniRepos.service';
import adminCompanyService from '../../services/admin/companies.service';
import FileUploader from '../../components/shared/FileUploader';

function AlumnusForm({ initial, companies, onSave, onCancel }) {
  const [name,             setName]             = useState(initial?.name || '');
  const [rollNo,           setRollNo]           = useState(initial?.rollNo || '');
  const [linkedin,         setLinkedin]         = useState(initial?.linkedin || '');
  const [github,           setGithub]           = useState(initial?.github || '');
  const [email,            setEmail]            = useState(initial?.email || '');
  const [profileImage,     setProfileImage]     = useState(initial?.profileImage || null);
  const [companiesSecured, setCompaniesSecured] = useState(initial?.companiesSecured || []);

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const handleAddSecuredCompany = () => {
    setCompaniesSecured([
      ...companiesSecured,
      { company: companies[0]?._id || '', offerType: 'Full-Time', ctc: '', interviewQuestionsStr: '', reviews: '', tips: '' },
    ]);
  };

  const handleUpdateSecuredCompany = (idx, field, value) => {
    const updated = [...companiesSecured];
    updated[idx] = { ...updated[idx], [field]: value };
    setCompaniesSecured(updated);
  };

  const handleRemoveSecuredCompany = (idx) => {
    setCompaniesSecured(companiesSecured.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Alumnus name is required.'); return; }
    setError(''); setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        rollNo: rollNo.trim(),
        linkedin: linkedin.trim(),
        github: github.trim(),
        email: email.trim(),
        profileImage,
        companiesSecured: companiesSecured.map((c) => ({
          company: typeof c.company === 'object' ? c.company._id : c.company,
          offerType: (c.offerType || 'Full-Time').trim(),
          ctc: (c.ctc || '').trim(),
          interviewQuestions: Array.isArray(c.interviewQuestions)
            ? c.interviewQuestions
            : (c.interviewQuestionsStr || '').split(',').map((q) => q.trim()).filter(Boolean),
          reviews: (c.reviews || '').trim(),
          tips: (c.tips || '').trim(),
        })).filter(c => c.company),
      };

      if (initial?._id) {
        await adminAlumniRepoService.update(initial._id, payload);
      } else {
        await adminAlumniRepoService.create(payload);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save alumnus profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">⚠ {error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Profile Image Uploader */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Profile Photo</label>
          <FileUploader
            currentUrl={profileImage}
            onUploadSuccess={(url) => setProfileImage(url)}
            onRemove={() => setProfileImage(null)}
            uploadType="profilePhoto"
            accept="image/*"
            maxSizeMB={5}
            label="Upload Photo"
          />
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Full Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul Sharma" className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Roll Number</label>
            <input type="text" value={rollNo} onChange={(e) => setRollNo(e.target.value)} placeholder="e.g. 209X1A3301" className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs font-mono" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">LinkedIn URL</label>
          <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">GitHub URL</label>
          <input type="text" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/..." className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alumnus@domain.com" className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
        </div>
      </div>

      {/* Repeatable Companies Secured Editor */}
      <div className="border border-[var(--color-border)] rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Companies Secured & Interview Experience</p>
          <button type="button" onClick={handleAddSecuredCompany} className="text-xs font-bold text-[var(--color-accent)] hover:underline">+ Add Secured Company</button>
        </div>

        {companiesSecured.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)] italic">No companies added yet. Click above to add secured offers.</p>
        ) : (
          companiesSecured.map((c, idx) => {
            const companyId = typeof c.company === 'object' ? c.company?._id : c.company;
            return (
              <div key={idx} className="p-4 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg-secondary)]/40 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">Company Offer #{idx + 1}</span>
                  <button type="button" onClick={() => handleRemoveSecuredCompany(idx)} className="text-xs text-red-500 font-bold hover:underline">Remove</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-[var(--color-text-muted)]">Select Company</label>
                    <select
                      value={companyId || ''}
                      onChange={(e) => handleUpdateSecuredCompany(idx, 'company', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-xs rounded-lg font-bold"
                    >
                      <option value="">Select Company Drive...</option>
                      {companies.map((comp) => (
                        <option key={comp._id} value={comp._id}>{comp.name} ({comp.academicYear})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-[var(--color-text-muted)]">Offer Type</label>
                    <input type="text" value={c.offerType || ''} onChange={(e) => handleUpdateSecuredCompany(idx, 'offerType', e.target.value)} placeholder="Full-time, PPO, Internship" className="w-full px-2.5 py-1.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-xs rounded-lg" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-[var(--color-text-muted)]">CTC Offered</label>
                    <input type="text" value={c.ctc || ''} onChange={(e) => handleUpdateSecuredCompany(idx, 'ctc', e.target.value)} placeholder="14 LPA" className="w-full px-2.5 py-1.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-xs rounded-lg" />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-[var(--color-text-muted)]">Interview Questions Asked (comma-separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(c.interviewQuestions) ? c.interviewQuestions.join(', ') : c.interviewQuestionsStr || ''}
                    onChange={(e) => handleUpdateSecuredCompany(idx, 'interviewQuestionsStr', e.target.value)}
                    placeholder="Reverse a Linked List, System Design of WhatsApp, SQL Joins..."
                    className="w-full px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-xs rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-[var(--color-text-muted)]">Company Review & Process Experience</label>
                    <textarea value={c.reviews || ''} onChange={(e) => handleUpdateSecuredCompany(idx, 'reviews', e.target.value)} rows={2} placeholder="Write detailed experience..." className="w-full px-2.5 py-1.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-xs rounded-lg" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-[var(--color-text-muted)]">Preparation Tips for Juniors</label>
                    <textarea value={c.tips || ''} onChange={(e) => handleUpdateSecuredCompany(idx, 'tips', e.target.value)} rows={2} placeholder="Key advice, resources to study..." className="w-full px-2.5 py-1.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-xs rounded-lg" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && <button type="button" onClick={onCancel} className="px-4 py-2 border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-secondary)]">Cancel</button>}
        <button type="submit" disabled={saving} className="px-5 py-2 bg-[var(--color-accent)] text-white font-bold text-xs rounded-xl disabled:opacity-50">
          {saving ? 'Saving…' : initial ? 'Update Alumnus' : 'Create Alumnus Profile'}
        </button>
      </div>
    </form>
  );
}

export default function ManageAlumniRepos() {
  const [alumni, setAlumni]       = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [alumniData, compData] = await Promise.all([
        adminAlumniRepoService.list(),
        adminCompanyService.list(),
      ]);
      setAlumni(alumniData);
      setCompanies(compData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (alum) => {
    if (!window.confirm(`Delete alumnus profile "${alum.name}"?`)) return;
    try { await adminAlumniRepoService.remove(alum._id); load(); }
    catch (err) { alert(err.response?.data?.message || 'Delete failed.'); }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Manage Alumni Repository</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Add alumnus profiles, photos, secured companies, reviews, interview questions, and tips</p>
        </div>
        {!showForm && !editTarget && (
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-[var(--color-accent)] text-white font-bold text-xs rounded-xl">
            + Add Alumnus Profile
          </button>
        )}
      </div>

      {(showForm || editTarget) && (
        <div className="glass-card p-6 border-l-4 border-[var(--color-accent)]">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">{editTarget ? 'Edit Alumnus Profile' : 'New Alumnus Profile'}</h3>
          <AlumnusForm initial={editTarget} companies={companies} onSave={() => { setShowForm(false); setEditTarget(null); load(); }} onCancel={() => { setShowForm(false); setEditTarget(null); }} />
        </div>
      )}

      {/* Alumni List */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">{alumni.length} alumnus profile{alumni.length !== 1 ? 's' : ''}</h3>
        {loading ? (
          <p className="text-xs text-[var(--color-text-muted)] italic">Loading...</p>
        ) : alumni.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)] italic">No alumni repository profiles added yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {alumni.map((alum) => (
              <div key={alum._id} className="p-4 border border-[var(--color-border)] rounded-xl flex items-center justify-between gap-4 bg-[var(--color-surface)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-bold text-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {alum.profileImage ? <img src={alum.profileImage} alt={alum.name} className="w-full h-full object-cover" /> : alum.name?.charAt(0) || '🎓'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--color-text-primary)]">{alum.name}</h4>
                    <p className="text-[10px] text-[var(--color-text-muted)] font-mono">{alum.rollNo} · {alum.companiesSecured?.length || 0} secured companies</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditTarget(alum); setShowForm(false); }} className="px-3 py-1 border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)] rounded-lg">Edit</button>
                  <button onClick={() => handleDelete(alum)} className="px-3 py-1 border border-[var(--color-border)] text-red-500 hover:bg-red-500/10 text-xs font-bold rounded-lg">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
