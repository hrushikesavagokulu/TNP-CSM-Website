import { useState, useEffect } from 'react';
import departmentInfoService from '../../services/admin/departmentInfo.service';
import FileUploader from '../../components/shared/FileUploader';

export default function ManageDepartmentInfo() {
  // ── States ────────────────────────────────────────────────────────────────
  const [motto,   setMotto]   = useState('');
  const [vision,  setVision]  = useState('');
  const [mission, setMission] = useState('');
  const [heroUrl, setHeroUrl] = useState('');

  const [facultyList, setFacultyList] = useState([]);
  const [facForm, setFacForm] = useState({
    name: '',
    designation: '',
    qualifications: '',
    researchInterest: '',
    googleScholar: '',
    apaarId: '',
    vidwanProfile: '',
    email: '',
    isGuest: false,
    imageUrl: '',
  });

  const [schemeList, setSchemeList] = useState([]);
  const [schForm, setSchForm] = useState({ schemeYear: '', title: '', url: '' });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(null);

  // Load all configurations
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

  useEffect(() => {
    loadAll();
  }, []);

  // ── Action: Save vision/motto/mission ──────────────────────────────────────
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await departmentInfoService.updateDepartmentInfo({
        motto,
        vision,
        mission,
      });
      setSuccess('Department vision, motto, and mission updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update department text fields.');
    }
  };

  // ── Action: Hero Banner File Complete ──────────────────────────────────────
  const handleHeroComplete = (data) => {
    setSuccess('Hero banner uploaded successfully.');
    setHeroUrl(data.fileUrl);
    // Explicitly update singleton record with the new URL
    departmentInfoService.updateDepartmentInfo({ heroImageUrl: data.fileUrl });
  };

  // ── Action: Faculty Photo upload complete ──────────────────────────────────
  const handleFacPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setError(null);
      setSuccess(null);
      const data = await departmentInfoService.uploadFacultyPhoto(formData);
      setFacForm(prev => ({ ...prev, imageUrl: data.fileUrl }));
      setSuccess('Faculty photo uploaded successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload faculty photo.');
    }
  };

  // ── Faculty links Operations ───────────────────────────────────────────────
  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { name, designation } = facForm;
    if (!name.trim() || !designation.trim()) {
      setError('Please fill out Name and Designation fields.');
      return;
    }

    try {
      const nextOrder = facultyList.length > 0 ? Math.max(...facultyList.map(f => f.order || 0)) + 1 : 0;
      await departmentInfoService.createFacultyLink({ ...facForm, order: nextOrder });
      setFacForm({
        name: '',
        designation: '',
        qualifications: '',
        researchInterest: '',
        googleScholar: '',
        apaarId: '',
        vidwanProfile: '',
        email: '',
        isGuest: false,
        imageUrl: '',
      });
      loadAll();
      setSuccess('Faculty profile created successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create faculty link.');
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (!window.confirm('Delete this faculty profile?')) return;
    setError(null);
    try {
      await departmentInfoService.deleteFacultyLink(id);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete faculty profile.');
    }
  };

  const handleMoveFaculty = async (index, direction) => {
    setError(null);
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= facultyList.length) return;

    const list = [...facultyList];
    // Swap order values
    const tempOrder = list[index].order;
    list[index].order = list[targetIdx].order;
    list[targetIdx].order = tempOrder;

    try {
      await departmentInfoService.updateFacultyLink(list[index]._id, { order: list[index].order });
      await departmentInfoService.updateFacultyLink(list[targetIdx]._id, { order: list[targetIdx].order });
      loadAll();
    } catch (err) {
      setError('Failed to reorder faculty links.');
    }
  };

  // ── Scheme / Syllabus links Operations ──────────────────────────────────────
  const handleCreateScheme = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { schemeYear, title, url } = schForm;
    if (!schemeYear.trim() || !title.trim() || !url.trim()) {
      setError('Please fill out scheme year, title, and URL.');
      return;
    }

    try {
      const nextOrder = schemeList.length > 0 ? Math.max(...schemeList.map(s => s.order || 0)) + 1 : 0;
      await departmentInfoService.createSchemeLink({ ...schForm, order: nextOrder });
      setSchForm({ schemeYear: '', title: '', url: '' });
      loadAll();
      setSuccess('Syllabus Scheme created successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create scheme link.');
    }
  };

  const handleDeleteScheme = async (id) => {
    if (!window.confirm('Delete this syllabus card?')) return;
    setError(null);
    try {
      await departmentInfoService.deleteSchemeLink(id);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete scheme link.');
    }
  };

  const handleMoveScheme = async (index, direction) => {
    setError(null);
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= schemeList.length) return;

    const list = [...schemeList];
    // Swap order values
    const tempOrder = list[index].order;
    list[index].order = list[targetIdx].order;
    list[targetIdx].order = tempOrder;

    try {
      await departmentInfoService.updateSchemeLink(list[index]._id, { order: list[index].order });
      await departmentInfoService.updateSchemeLink(list[targetIdx]._id, { order: list[targetIdx].order });
      loadAll();
    } catch (err) {
      setError('Failed to reorder scheme syllabus links.');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans pb-12">
      
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Manage Department Info</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">Configure visions, HOD banners, syllabus schemes, and faculty profile directories</p>
      </div>

      {/* Global feedback messages */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-xs text-[var(--color-error)] animate-fade-in">
          ⚠ {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 rounded-xl bg-[var(--color-success-bg)] border border-[var(--color-success)]/20 text-xs text-[var(--color-success)] font-medium animate-fade-in">
          ✓ {success}
        </div>
      )}

      {/* 1. Vision/motto/mission form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Texts editor */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-4">Visons & Mottos Text Editor</h3>
          <form onSubmit={handleSaveInfo} className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Department Motto</label>
              <textarea
                id="dept-motto"
                rows="2"
                placeholder="CSE- Artificial Intelligence and Machine Learning Department helps its students..."
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Vision Statement</label>
              <textarea
                id="dept-vision"
                rows="3"
                placeholder="The department aims to become a leader..."
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Mission Statement</label>
              <textarea
                id="dept-mission"
                rows="4"
                placeholder="M1: To facilitate competent...&#10;M2: To inculcate interest..."
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <button id="dept-info-submit" type="submit" className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg w-fit">
              Save Vision Details
            </button>
          </form>
        </div>

        {/* Hero image uploader */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">HOD Banner Banner</h3>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Upload the campus block building or placement board banner. Replaces the default homepage background.
          </p>

          <FileUploader
            uploadUrl="/admin/department-info/upload-hero-image"
            fieldName="image"
            accept="image/jpeg, image/png, image/webp"
            maxSizeMB={5}
            onUploadComplete={handleHeroComplete}
          />

          {heroUrl && (
            <div className="mt-2">
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] block mb-1">Active Banner Preview:</span>
              <img src={heroUrl} alt="Banner Preview" className="w-full h-24 object-cover rounded-lg border border-[var(--color-border)]" />
            </div>
          )}
        </div>

      </div>

      {/* 2. Faculty Link CRUD Section */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-2">Manage Faculty Directory Profiles</h3>
        <p className="text-xs text-[var(--color-text-secondary)] mb-4">Add, reorder, or remove complete faculty listing cards.</p>
        
        <div className="flex flex-col gap-6">
          {/* Create Form */}
          <form onSubmit={handleCreateFaculty} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-[var(--color-border)]/50 pb-6">
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Faculty Name *</label>
                <input
                  id="create-fac-name"
                  type="text"
                  placeholder="Dr. R. Praveen Sam"
                  value={facForm.name}
                  onChange={(e) => setFacForm({ ...facForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Designation / Role *</label>
                <input
                  id="create-fac-designation"
                  type="text"
                  placeholder="Professor & HoD"
                  value={facForm.designation}
                  onChange={(e) => setFacForm({ ...facForm, designation: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Qualifications</label>
                <input
                  id="create-fac-qualifications"
                  type="text"
                  placeholder="Ph.D"
                  value={facForm.qualifications}
                  onChange={(e) => setFacForm({ ...facForm, qualifications: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Research Interest Area</label>
                <input
                  id="create-fac-research"
                  type="text"
                  placeholder="Computer Networks"
                  value={facForm.researchInterest}
                  onChange={(e) => setFacForm({ ...facForm, researchInterest: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Google Scholar URL</label>
                <input
                  id="create-fac-scholar"
                  type="text"
                  placeholder="https://scholar.google.com/..."
                  value={facForm.googleScholar}
                  onChange={(e) => setFacForm({ ...facForm, googleScholar: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">APAAR ID / Organizations</label>
                <input
                  id="create-fac-apaar"
                  type="text"
                  placeholder="811167259826"
                  value={facForm.apaarId}
                  onChange={(e) => setFacForm({ ...facForm, apaarId: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Vidwan Profile Link</label>
                <input
                  id="create-fac-vidwan"
                  type="text"
                  placeholder="https://vidwan.inflibnet.ac.in/..."
                  value={facForm.vidwanProfile}
                  onChange={(e) => setFacForm({ ...facForm, vidwanProfile: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Contact Email Address</label>
                <input
                  id="create-fac-email"
                  type="text"
                  placeholder="email@gprec.ac.in"
                  value={facForm.email}
                  onChange={(e) => setFacForm({ ...facForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none"
                />
              </div>

              {/* Upload Profile Photo field */}
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Profile Photo Upload</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFacPhotoUpload}
                    className="text-xs text-[var(--color-text-muted)] w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-red-500/10 file:text-red-500 hover:file:bg-red-500/20"
                  />
                  {facForm.imageUrl && (
                    <img src={facForm.imageUrl} alt="Thumbnail preview" className="w-8 h-8 rounded-full object-cover border border-[var(--color-border)]" />
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-3 flex items-center justify-between gap-4 mt-2">
              <div className="flex items-center gap-2">
                <input
                  id="create-fac-guest"
                  type="checkbox"
                  checked={facForm.isGuest}
                  onChange={(e) => setFacForm({ ...facForm, isGuest: e.target.checked })}
                  className="w-4 h-4 rounded text-red-500 focus:ring-red-500 border-[var(--color-border)] bg-[var(--color-surface)]"
                />
                <label className="text-xs text-[var(--color-text-secondary)] font-bold">Mark as GUEST Faculty</label>
              </div>

              <button id="create-faculty-submit" type="submit" className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg w-fit">
                Add Faculty Link Profile
              </button>
            </div>
          </form>

          {/* List display */}
          <div className="border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-bg-secondary)]/10">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-[var(--color-text-secondary)] border-collapse text-left min-w-[700px]">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/30 font-bold text-[var(--color-text-muted)]">
                    <th className="p-3 w-16 text-center">Photo</th>
                    <th className="p-3">Faculty Name</th>
                    <th className="p-3 w-44">Designation</th>
                    <th className="p-3 w-32">Qualifications</th>
                    <th className="p-3 w-28">Guest Flag</th>
                    <th className="p-3 text-center w-24">Reorder</th>
                    <th className="p-3 text-center w-16">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]/50 bg-[var(--color-surface)]">
                  {facultyList.length > 0 ? (
                    facultyList.map((fac, index) => (
                      <tr key={fac._id} className="hover:bg-[var(--color-bg-secondary)]/10 transition-colors">
                        <td className="p-3 text-center">
                          {fac.imageUrl ? (
                            <img src={fac.imageUrl} alt={fac.name} className="w-7 h-7 rounded-full object-cover border border-[var(--color-border)] mx-auto" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-[10px] mx-auto">
                              {fac.name.split('.').pop().trim().charAt(0)}
                            </div>
                          )}
                        </td>
                        <td className="p-3 truncate font-bold text-[var(--color-text-primary)]">{fac.name}</td>
                        <td className="p-3 truncate">{fac.designation}</td>
                        <td className="p-3 truncate">{fac.qualifications || 'N/A'}</td>
                        <td className="p-3">
                          {fac.isGuest ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold text-[9px] uppercase tracking-wider">Guest</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 font-bold text-[9px] uppercase tracking-wider">Regular</span>
                          )}
                        </td>
                        <td className="p-3 text-center flex items-center justify-center gap-1.5 mt-1">
                          <button
                            onClick={() => handleMoveFaculty(index, 'up')}
                            disabled={index === 0}
                            className="p-1 border border-[var(--color-border)] hover:border-red-500/30 text-[var(--color-text-secondary)] hover:text-red-500 rounded disabled:opacity-30"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => handleMoveFaculty(index, 'down')}
                            disabled={index === facultyList.length - 1}
                            className="p-1 border border-[var(--color-border)] hover:border-red-500/30 text-[var(--color-text-secondary)] hover:text-red-500 rounded disabled:opacity-30"
                          >
                            ▼
                          </button>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteFaculty(fac._id)}
                            className="text-red-400 hover:text-red-500 font-bold text-[10px]"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-[var(--color-text-muted)] italic">No faculty listings created yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Academic schemes CRUD links */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-2">Manage Syllabus & Schemes</h3>
        <p className="text-xs text-[var(--color-text-secondary)] mb-4">Add, reorder, or delete cards matching dynamic scheme years (e.g. Scheme-2020, Scheme-2023)</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Form */}
          <form onSubmit={handleCreateScheme} className="flex flex-col gap-3">
            <div>
              <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Scheme Year (e.g. Scheme-2020)</label>
              <input
                id="create-scheme-year"
                type="text"
                placeholder="Scheme-2023"
                value={schForm.schemeYear}
                onChange={(e) => setSchForm({ ...schForm, schemeYear: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Card Title (e.g. SYLLABUS FOR II B.TECH)</label>
              <input
                id="create-scheme-title"
                type="text"
                placeholder="SYLLABUS FOR II B.TECH"
                value={schForm.title}
                onChange={(e) => setSchForm({ ...schForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Syllabus PDF Link</label>
              <input
                id="create-scheme-url"
                type="text"
                placeholder="https://www.gprec.ac.in/scheme-2023/..."
                value={schForm.url}
                onChange={(e) => setSchForm({ ...schForm, url: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none"
              />
            </div>
            <button id="create-scheme-submit" type="submit" className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg w-fit mt-1">
              Add Scheme Link
            </button>
          </form>

          {/* List display */}
          <div className="lg:col-span-2 border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-bg-secondary)]/10">
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
                      <td className="p-3 truncate max-w-xs">{sch.title}</td>
                      <td className="p-3 text-center flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleMoveScheme(index, 'up')}
                          disabled={index === 0}
                          className="p-1 border border-[var(--color-border)] hover:border-red-500/30 text-[var(--color-text-secondary)] hover:text-red-500 rounded disabled:opacity-30"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleMoveScheme(index, 'down')}
                          disabled={index === schemeList.length - 1}
                          className="p-1 border border-[var(--color-border)] hover:border-red-500/30 text-[var(--color-text-secondary)] hover:text-red-500 rounded disabled:opacity-30"
                        >
                          ▼
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteScheme(sch._id)}
                          className="text-red-400 hover:text-red-500 font-bold text-[10px]"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-[var(--color-text-muted)] italic">No schemes added yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
