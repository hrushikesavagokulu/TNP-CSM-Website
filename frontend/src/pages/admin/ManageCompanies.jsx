import { useState, useEffect, useCallback } from 'react';
import adminCompanyService from '../../services/admin/companies.service';
import adminAlumniRepoService from '../../services/admin/alumniRepos.service';
import ContentBlockEditor from '../../components/shared/ContentBlockEditor';

function CompanyForm({ initial, onSave, onCancel }) {
  const [name,                setName]                = useState(initial?.name || '');
  const [description,         setDescription]         = useState(initial?.description || '');
  const [aboutCompany,        setAboutCompany]        = useState(initial?.aboutCompany || '');
  const [status,              setStatus]              = useState(initial?.status || 'upcoming');
  const [academicYear,        setAcademicYear]        = useState(initial?.academicYear || '2024-2025');
  const [driveDate,           setDriveDate]           = useState(initial?.driveDate ? initial.driveDate.slice(0, 10) : '');
  const [eligibilityCriteria, setEligibilityCriteria] = useState(initial?.eligibilityCriteria || '');
  const [ctc,                 setCtc]                 = useState(initial?.ctc || '');
  const [rolesStr,            setRolesStr]            = useState(initial?.roles ? initial.roles.join(', ') : '');
  const [recruitmentProcess,  setRecruitmentProcess]  = useState(initial?.recruitmentProcess || '');
  const [prevYearProcess,     setPrevYearProcess]     = useState(initial?.prevYearProcess || '');
  const [offlineOrOnline,     setOfflineOrOnline]     = useState(initial?.offlineOrOnline || 'offline');
  const [totalCleared,        setTotalCleared]        = useState(initial?.totalCleared ?? 0);
  const [rounds,              setRounds]              = useState(initial?.rounds || []);
  const [prevYearQuestions,   setPrevYearQuestions]   = useState(initial?.prevYearQuestions || []);
  
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  // Round management helpers
  const handleAddRound = () => {
    setRounds([...rounds, { roundName: `Round ${rounds.length + 1}`, attended: 0, passed: 0, eliminated: 0, focusTopics: [], details: '' }]);
  };

  const handleUpdateRound = (idx, field, value) => {
    const updated = [...rounds];
    updated[idx] = { ...updated[idx], [field]: value };
    // Auto-calculate eliminated if attended and passed are present
    if (field === 'attended' || field === 'passed') {
      const att = field === 'attended' ? Number(value) : Number(updated[idx].attended);
      const pas = field === 'passed' ? Number(value) : Number(updated[idx].passed);
      updated[idx].eliminated = Math.max(0, att - pas);
    }
    setRounds(updated);
  };

  const handleRemoveRound = (idx) => {
    setRounds(rounds.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Company name is required.'); return; }
    setError(''); setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        aboutCompany: aboutCompany.trim(),
        status,
        academicYear: academicYear.trim(),
        driveDate: driveDate ? new Date(driveDate) : undefined,
        eligibilityCriteria: eligibilityCriteria.trim(),
        ctc: ctc.trim(),
        roles: rolesStr.split(',').map((r) => r.trim()).filter(Boolean),
        recruitmentProcess: recruitmentProcess.trim(),
        prevYearProcess: prevYearProcess.trim(),
        offlineOrOnline,
        totalCleared: Number(totalCleared),
        rounds: rounds.map((r) => ({
          roundName: r.roundName.trim(),
          attended: Number(r.attended || 0),
          passed: Number(r.passed || 0),
          eliminated: Number(r.eliminated || 0),
          focusTopics: Array.isArray(r.focusTopics) ? r.focusTopics : (r.focusTopicsStr || '').split(',').map(t => t.trim()).filter(Boolean),
          details: (r.details || '').trim(),
        })),
        prevYearQuestions: prevYearQuestions.map((b, i) => ({
          type: b.type, label: b.label, value: b.value, order: b.order ?? i,
        })),
      };

      if (initial?._id) {
        await adminCompanyService.update(initial._id, payload);
      } else {
        await adminCompanyService.create(payload);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save company.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">⚠ {error}</div>}

      {/* Main Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Company Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Microsoft, Amazon, TCS" className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Lifecycle Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs font-bold">
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Academic Year</label>
          <input type="text" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="2024-2025" className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Drive Date</label>
          <input type="date" value={driveDate} onChange={(e) => setDriveDate(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">CTC Offered</label>
          <input type="text" value={ctc} onChange={(e) => setCtc(e.target.value)} placeholder="e.g. 12 LPA, 4.5 - 7.5 LPA" className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Mode</label>
          <select value={offlineOrOnline} onChange={(e) => setOfflineOrOnline(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs">
            <option value="offline">Offline</option>
            <option value="online">Online</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Offered Roles (comma-separated)</label>
          <input type="text" value={rolesStr} onChange={(e) => setRolesStr(e.target.value)} placeholder="SDE-1, Data Analyst, Cloud Engineer" className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Total Students Placed</label>
          <input type="number" value={totalCleared} onChange={(e) => setTotalCleared(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Short Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">About Company & Eligibility Criteria</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <textarea value={aboutCompany} onChange={(e) => setAboutCompany(e.target.value)} placeholder="About company..." rows={3} className="px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
          <textarea value={eligibilityCriteria} onChange={(e) => setEligibilityCriteria(e.target.value)} placeholder="Eligibility criteria (CGPA, active backlogs, branches...)" rows={3} className="px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Recruitment & Previous Year Technical Assessment Flow</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <textarea value={recruitmentProcess} onChange={(e) => setRecruitmentProcess(e.target.value)} placeholder="Current recruitment process details..." rows={3} className="px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
          <textarea value={prevYearProcess} onChange={(e) => setPrevYearProcess(e.target.value)} placeholder="Previous year technical assessment details, coding round & targeted interview topics..." rows={3} className="px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs" />
        </div>
      </div>

      {/* Repeatable Round Progression Editor */}
      <div className="border border-[var(--color-border)] rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Round-by-Round Progression & Elimination Editor</p>
          <button type="button" onClick={handleAddRound} className="text-xs font-bold text-[var(--color-accent)] hover:underline">+ Add Round</button>
        </div>
        {rounds.map((rd, idx) => (
          <div key={idx} className="p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg-secondary)]/40 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <input type="text" value={rd.roundName} onChange={(e) => handleUpdateRound(idx, 'roundName', e.target.value)} placeholder="Round Name" className="px-3 py-1 border border-[var(--color-border)] bg-[var(--color-surface)] font-bold text-xs rounded-lg w-48" />
              <button type="button" onClick={() => handleRemoveRound(idx)} className="text-xs text-red-500 font-bold hover:underline">Remove</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] font-bold text-[var(--color-text-muted)]">Attempted</label>
                <input type="number" value={rd.attended} onChange={(e) => handleUpdateRound(idx, 'attended', e.target.value)} className="w-full px-2 py-1 border border-[var(--color-border)] bg-[var(--color-surface)] text-xs rounded" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-[var(--color-text-muted)]">Passed</label>
                <input type="number" value={rd.passed} onChange={(e) => handleUpdateRound(idx, 'passed', e.target.value)} className="w-full px-2 py-1 border border-[var(--color-border)] bg-[var(--color-surface)] text-xs rounded" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-[var(--color-text-muted)]">Eliminated</label>
                <input type="number" value={rd.eliminated} onChange={(e) => handleUpdateRound(idx, 'eliminated', e.target.value)} className="w-full px-2 py-1 border border-[var(--color-border)] bg-[var(--color-surface)] text-xs rounded" />
              </div>
            </div>
            <input
              type="text"
              value={Array.isArray(rd.focusTopics) ? rd.focusTopics.join(', ') : rd.focusTopicsStr || ''}
              onChange={(e) => handleUpdateRound(idx, 'focusTopicsStr', e.target.value)}
              placeholder="Focus Topics (comma-separated, e.g. DSA, SQL, System Design)"
              className="px-3 py-1 border border-[var(--color-border)] bg-[var(--color-surface)] text-xs rounded-lg"
            />
          </div>
        ))}
      </div>

      {/* REUSED ContentBlockEditor for Previous Year Questions */}
      <div className="border border-[var(--color-border)] rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Previous Year Questions & Study Material Blocks (Reused Editor)</p>
        <ContentBlockEditor blocks={prevYearQuestions} onChange={setPrevYearQuestions} />
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && <button type="button" onClick={onCancel} className="px-4 py-2 border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-secondary)]">Cancel</button>}
        <button type="submit" disabled={saving} className="px-5 py-2 bg-[var(--color-accent)] text-white font-bold text-xs rounded-xl disabled:opacity-50">
          {saving ? 'Saving…' : initial ? 'Update Company' : 'Create Company'}
        </button>
      </div>
    </form>
  );
}

export default function ManageCompanies() {
  const [companies, setCompanies]   = useState([]);
  const [allAlumni, setAllAlumni]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [linkingCompany, setLinkingCompany] = useState(null);
  const [selectedAlumniId, setSelectedAlumniId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [compData, alumniData] = await Promise.all([
        adminCompanyService.list(),
        adminAlumniRepoService.list(),
      ]);
      setCompanies(compData);
      setAllAlumni(alumniData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (comp) => {
    if (!window.confirm(`Delete company "${comp.name}"?`)) return;
    try { await adminCompanyService.remove(comp._id); load(); }
    catch (err) { alert(err.response?.data?.message || 'Delete failed.'); }
  };

  const handleStatusTransition = async (comp, newStatus) => {
    try {
      await adminCompanyService.updateStatus(comp._id, newStatus);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed.');
    }
  };

  const handleLinkAlumni = async (e) => {
    e.preventDefault();
    if (!linkingCompany || !selectedAlumniId) return;
    try {
      await adminCompanyService.linkAlumniRepo(linkingCompany._id, selectedAlumniId);
      setLinkingCompany(null);
      setSelectedAlumniId('');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Linking failed.');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Manage Companies</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Create placement drives, update status transitions, add round statistics, and link alumni repos</p>
        </div>
        {!showForm && !editTarget && (
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-[var(--color-accent)] text-white font-bold text-xs rounded-xl">
            + Add Company
          </button>
        )}
      </div>

      {(showForm || editTarget) && (
        <div className="glass-card p-6 border-l-4 border-[var(--color-accent)]">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-4 uppercase tracking-wider">{editTarget ? 'Edit Company' : 'New Company Drive'}</h3>
          <CompanyForm initial={editTarget} onSave={() => { setShowForm(false); setEditTarget(null); load(); }} onCancel={() => { setShowForm(false); setEditTarget(null); }} />
        </div>
      )}

      {/* Link Alumni Modal */}
      {linkingCompany && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleLinkAlumni} className="glass-card p-6 w-full max-w-md flex flex-col gap-4 border border-[var(--color-border)]">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Link Alumni Repository to {linkingCompany.name}</h3>
            <select
              value={selectedAlumniId}
              onChange={(e) => setSelectedAlumniId(e.target.value)}
              className="px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-xs rounded-xl text-[var(--color-text-primary)]"
            >
              <option value="">Select Alumnus Profile...</option>
              {allAlumni.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name} ({a.rollNo || 'Alumnus'})
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setLinkingCompany(null)} className="px-3 py-1.5 border border-[var(--color-border)] text-xs font-bold rounded-lg text-[var(--color-text-secondary)]">Cancel</button>
              <button type="submit" disabled={!selectedAlumniId} className="px-4 py-1.5 bg-[var(--color-accent)] text-white text-xs font-bold rounded-lg disabled:opacity-40">Link Alumnus</button>
            </div>
          </form>
        </div>
      )}

      {/* Company List */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">{companies.length} company drive{companies.length !== 1 ? 's' : ''}</h3>
        {loading ? (
          <p className="text-xs text-[var(--color-text-muted)] italic">Loading...</p>
        ) : companies.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)] italic">No companies added yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {companies.map((comp) => (
              <div key={comp._id} className="p-4 border border-[var(--color-border)] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)]">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-[var(--color-text-primary)]">{comp.name}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20">
                      {comp.status}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] font-mono">{comp.academicYear}</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    CTC: {comp.ctc || 'N/A'} · Placed: {comp.totalCleared || 0} students · {comp.linkedAlumniRepos?.length || 0} linked alumni
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Transition Control */}
                  <select
                    value={comp.status}
                    onChange={(e) => handleStatusTransition(comp, e.target.value)}
                    className="px-2.5 py-1 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-xs font-bold rounded-lg"
                  >
                    <option value="upcoming">→ Move to Upcoming</option>
                    <option value="ongoing">→ Move to Ongoing</option>
                    <option value="completed">→ Move to Completed</option>
                  </select>

                  <button onClick={() => setLinkingCompany(comp)} className="px-3 py-1 border border-[var(--color-border)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 text-xs font-bold rounded-lg">
                    + Link Alumni
                  </button>
                  <button onClick={() => { setEditTarget(comp); setShowForm(false); }} className="px-3 py-1 border border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs font-bold rounded-lg">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(comp)} className="px-3 py-1 border border-[var(--color-border)] text-red-500 hover:bg-red-500/10 text-xs font-bold rounded-lg">
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
