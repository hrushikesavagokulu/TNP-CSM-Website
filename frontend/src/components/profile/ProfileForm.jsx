import { useState, useEffect } from 'react';
import profileService from '../../services/profile.service';
import FileUploader from '../shared/FileUploader';
import OtpInput from '../shared/OtpInput';

export default function ProfileForm({ user, onUpdate }) {
  const [form, setForm] = useState({
    phone: '', parentPhone: '', branch: '', isHostel: false,
    laptopAvailable: false, mncOrHigherEd: false, skills: [],
    links: { linkedin: '', github: '', leetcode: '', portfolio: '' },
    projectLinks: [''], achievements: [], profileImage: null,
  });

  const [skillsCatalogue, setSkillsCatalogue] = useState([]);
  const [loading,           setLoading]         = useState(false);
  const [successMsg,        setSuccessMsg]      = useState(null);
  const [errorMsg,          setErrorMsg]        = useState(null);

  // ── Password Modal State ──────────────────────────────────────────────────
  const [passModal, setPassModal] = useState({
    open: false, step: 1, otp: '', newPassword: '', confirmPassword: '',
    error: null, success: false, loading: false, attempts: null,
  });

  // Load user data and skills catalogue
  useEffect(() => {
    if (user) {
      setForm({
        phone:           user.phone || '',
        parentPhone:     user.parentPhone || '',
        branch:          user.branch || '',
        isHostel:        !!user.isHostel,
        laptopAvailable: !!user.laptopAvailable,
        mncOrHigherEd:   !!user.mncOrHigherEd,
        skills:          user.skills || [],
        links: {
          linkedin:  user.links?.linkedin || '',
          github:    user.links?.github || '',
          leetcode:  user.links?.leetcode || '',
          portfolio: user.links?.portfolio || '',
        },
        projectLinks:    user.projectLinks?.length ? [...user.projectLinks] : [''],
        achievements:    user.achievements || [],
        profileImage:    user.profileImage || null,
      });
    }

    profileService.getSkillsCatalogue()
      .then(setSkillsCatalogue)
      .catch((err) => console.error('Failed to load skills:', err));
  }, [user]);

  // Form input setters
  const setField = (field, val) => setForm((prev) => ({ ...prev, [field]: val }));
  const setLink = (key, val) => setForm((prev) => ({
    ...prev,
    links: { ...prev.links, [key]: val },
  }));

  const [customSkill, setCustomSkill] = useState('');

  // Handle skills multi-select toggle & custom additions
  const toggleSkill = (skill) => {
    const exists = form.skills.some((s) => s.toLowerCase() === skill.toLowerCase());
    const next = exists
      ? form.skills.filter((s) => s.toLowerCase() !== skill.toLowerCase())
      : [...form.skills, skill];
    setField('skills', next);
  };

  const addCustomSkill = (e) => {
    if (e) e.preventDefault();
    const trimmed = customSkill.trim();
    if (!trimmed) return;

    const exists = form.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      setField('skills', [...form.skills, trimmed]);
    }
    setCustomSkill('');
  };

  const removeSkill = (skillToRemove) => {
    setField('skills', form.skills.filter((s) => s.toLowerCase() !== skillToRemove.toLowerCase()));
  };

  // Project link actions
  const addProjectLink = () => setField('projectLinks', [...form.projectLinks, '']);
  const removeProjectLink = (index) => {
    const next = form.projectLinks.filter((_, i) => i !== index);
    setField('projectLinks', next.length ? next : ['']);
  };
  const setProjectLinkVal = (index, val) => {
    const next = [...form.projectLinks];
    next[index] = val;
    setField('projectLinks', next);
  };

  // Achievement handlers
  const [newAchievement, setNewAchievement] = useState({ title: '', description: '', date: '', fileUrl: '' });
  const [addingAchievement, setAddingAchievement] = useState(false);

  const saveNewAchievement = () => {
    if (!newAchievement.title.trim() || !newAchievement.fileUrl) {
      alert('Title and Uploaded File are required for achievements.');
      return;
    }
    const next = [...form.achievements, { ...newAchievement, date: newAchievement.date ? new Date(newAchievement.date) : null }];
    setField('achievements', next);
    setNewAchievement({ title: '', description: '', date: '', fileUrl: '' });
    setAddingAchievement(false);
  };

  const removeAchievement = (index) => {
    setField('achievements', form.achievements.filter((_, i) => i !== index));
  };

  // Submit main form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      // Filter out empty project links
      const payload = {
        ...form,
        projectLinks: form.projectLinks.filter((link) => link.trim() !== ''),
      };

      const updated = await profileService.updateProfile(payload);
      onUpdate?.(updated);
      setSuccessMsg('Profile updated successfully.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  // ── Password Modal Actions ────────────────────────────────────────────────
  const openPasswordModal = () => {
    setPassModal({
      open: true, step: 1, otp: '', newPassword: '', confirmPassword: '',
      error: null, success: false, loading: false, attempts: null,
    });
  };

  const requestPasswordOTP = async () => {
    setPassModal((m) => ({ ...m, loading: true, error: null }));
    try {
      await profileService.requestPasswordChangeOTP();
      setPassModal((m) => ({ ...m, step: 2 }));
    } catch (err) {
      setPassModal((m) => ({ ...m, error: err.response?.data?.message || 'Failed to request OTP.' }));
    } finally {
      setPassModal((m) => ({ ...m, loading: false }));
    }
  };

  const verifyPasswordOTP = async (e) => {
    if (e) e.preventDefault();
    const { otp, newPassword, confirmPassword } = passModal;

    if (!otp) {
      setPassModal((m) => ({ ...m, error: 'Please enter verification code.' }));
      return;
    }
    if (newPassword.length < 8) {
      setPassModal((m) => ({ ...m, error: 'New password must be at least 8 characters.' }));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassModal((m) => ({ ...m, error: 'Passwords do not match.' }));
      return;
    }

    setPassModal((m) => ({ ...m, loading: true, error: null }));
    try {
      await profileService.verifyPasswordChangeOTP(otp, newPassword);
      setPassModal((m) => ({ ...m, success: true, step: 3 }));
      setTimeout(() => {
        setPassModal((m) => ({ ...m, open: false }));
      }, 2000);
    } catch (err) {
      const data = err.response?.data;
      setPassModal((m) => ({
        ...m,
        error: data?.message || 'Failed to verify OTP.',
        attempts: data?.attemptsRemaining ?? null,
      }));
    } finally {
      setPassModal((m) => ({ ...m, loading: false }));
    }
  };

  return (
    <div className="w-full flex flex-col gap-8">
      
      {/* Alert Notices */}
      {successMsg && (
        <div className="px-4 py-3 rounded-xl bg-[var(--color-success-bg)] border border-[var(--color-success)]/20 text-sm text-[var(--color-success)]">
          ✓ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="px-4 py-3 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)]">
          ⚠ {errorMsg}
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

        {/* Profile Card Header */}
        <div className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-24 h-24 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] overflow-hidden flex-shrink-0">
            {form.profileImage ? (
              <img src={form.profileImage} alt={user?.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[var(--color-text-muted)]">
                {user?.name?.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{user?.name}</h2>
            <p className="text-sm text-[var(--color-text-muted)] uppercase tracking-wider font-mono">{user?.rollNo}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{user?.email}</p>
          </div>
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={openPasswordModal}
              className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-xs font-semibold
                text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-all"
            >
              🔒 Change Password
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Box 1: Profile Photo */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Profile Photo</h3>
            <FileUploader
              uploadUrl="/student/profile/upload-photo"
              fieldName="photo"
              accept="image/png, image/jpeg, image/webp"
              maxSizeMB={5}
              onUploadComplete={(url) => setField('profileImage', url)}
            />
          </div>

          {/* Box 2: Academic Info */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Academic Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[var(--color-text-muted)] block mb-1">Branch</label>
                <input type="text" value={form.branch} disabled className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 rounded-lg text-sm text-[var(--color-text-secondary)] cursor-not-allowed" />
              </div>
              <div>
                <label className="text-xs text-[var(--color-text-muted)] block mb-1">Year</label>
                <input type="text" value={user?.year ? `Year ${user.year}` : 'Not Specified'} disabled className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 rounded-lg text-sm text-[var(--color-text-secondary)] cursor-not-allowed" />
              </div>
            </div>
            
            {/* Switches */}
            <div className="flex flex-col gap-3 mt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isHostel} onChange={(e) => setField('isHostel', e.target.checked)} className="rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]" />
                <span className="text-sm text-[var(--color-text-secondary)]">Hostel student</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.laptopAvailable} onChange={(e) => setField('laptopAvailable', e.target.checked)} className="rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]" />
                <span className="text-sm text-[var(--color-text-secondary)]">Laptop available for test/lab</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.mncOrHigherEd} onChange={(e) => setField('mncOrHigherEd', e.target.checked)} className="rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]" />
                <span className="text-sm text-[var(--color-text-secondary)]">Interested in MNC Placement / Higher Education</span>
              </label>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Contact Numbers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[var(--color-text-muted)] block mb-1">Student Phone</label>
              <input type="text" value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="Student mobile number" className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent)]" />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] block mb-1">Parent Phone</label>
              <input type="text" value={form.parentPhone} onChange={(e) => setField('parentPhone', e.target.value)} placeholder="Parent/Guardian mobile number" className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent)]" />
            </div>
          </div>
        </div>

        {/* Skill Set Catalogue & Custom Skill Manager */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Skills & Tech Stack</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Add your technical skills, programming languages, and tools</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-[var(--color-accent)] bg-[var(--color-accent-subtle)] px-2.5 py-1 rounded-full w-fit">
              {form.skills.length} {form.skills.length === 1 ? 'skill' : 'skills'} added
            </span>
          </div>

          {/* Active / Selected Skills Chips */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Your Active Skills</label>
            {form.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-[var(--color-bg-secondary)]/40 border border-[var(--color-border)] min-h-[48px] items-center">
                {form.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--color-accent)] text-white shadow-sm transition-all"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-[10px] leading-none transition-colors"
                      title={`Remove ${skill}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)]/20 border border-dashed border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)]">
                No skills added yet. Type a custom skill below or pick from suggestions.
              </div>
            )}
          </div>

          {/* Custom Skill Input ("Writing Space") */}
          <div className="flex flex-col gap-1.5 pt-1">
            <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Add Any Custom Skill</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomSkill();
                  }
                }}
                placeholder="Type custom skill (e.g. PyTorch, Kubernetes, System Design)..."
                className="flex-1 px-3.5 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs focus:outline-none focus:border-[var(--color-accent)]"
              />
              <button
                type="button"
                onClick={addCustomSkill}
                disabled={!customSkill.trim()}
                className="px-4 py-2 bg-[var(--color-accent)] hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
              >
                Add Skill ✓
              </button>
            </div>
          </div>

          {/* Quick Suggestions Catalogue */}
          {skillsCatalogue.length > 0 && (
            <div className="flex flex-col gap-2 pt-3 border-t border-[var(--color-border)]">
              <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Catalogue Suggestions (Click to Add)</label>
              <div className="flex flex-wrap gap-2">
                {skillsCatalogue.map((skill) => {
                  const isSelected = form.skills.some((s) => s.toLowerCase() === skill.toLowerCase());
                  if (isSelected) return null; // Only show unselected suggestions
                  return (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className="px-3 py-1 rounded-full text-xs font-medium border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)] transition-all flex items-center gap-1"
                    >
                      <span>{skill}</span>
                      <span className="text-[10px] font-bold text-[var(--color-accent)]">+</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Links & Profiles */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Professional Profiles & Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[var(--color-text-muted)] block mb-1">LinkedIn Profile</label>
              <input type="text" value={form.links.linkedin} onChange={(e) => setLink('linkedin', e.target.value)} placeholder="https://linkedin.com/in/username" className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] block mb-1">GitHub Profile</label>
              <input type="text" value={form.links.github} onChange={(e) => setLink('github', e.target.value)} placeholder="https://github.com/username" className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] block mb-1">LeetCode Profile</label>
              <input type="text" value={form.links.leetcode} onChange={(e) => setLink('leetcode', e.target.value)} placeholder="https://leetcode.com/username" className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] block mb-1">Portfolio Website</label>
              <input type="text" value={form.links.portfolio} onChange={(e) => setLink('portfolio', e.target.value)} placeholder="https://username.dev" className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none" />
            </div>
          </div>

          {/* Project Links (Dynamic Array) */}
          <div className="flex flex-col gap-2 mt-2">
            <label className="text-xs text-[var(--color-text-secondary)] font-semibold block">Project Links</label>
            {form.projectLinks.map((link, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setProjectLinkVal(index, e.target.value)}
                  placeholder="https://myproject.com or demo link"
                  className="flex-1 px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeProjectLink(index)}
                  className="px-3 border border-[var(--color-border)] text-red-500 rounded-lg hover:bg-red-500/10 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addProjectLink}
              className="text-xs text-[var(--color-accent)] font-semibold self-start hover:underline mt-1"
            >
              + Add Project Link
            </button>
          </div>
        </div>

        {/* Achievements Upload Section */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Achievements & Certifications</h3>
          
          {/* Current Achievements List */}
          {form.achievements.length > 0 && (
            <div className="flex flex-col gap-3">
              {form.achievements.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg-secondary)]/30">
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-text-primary)]">{item.title}</p>
                    {item.description && <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{item.description}</p>}
                    <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-[10px] text-[var(--color-accent)] hover:underline mt-1 block">View Uploaded Document ↗</a>
                  </div>
                  <button type="button" onClick={() => removeAchievement(index)} className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Achievement Form toggle */}
          {!addingAchievement ? (
            <button
              type="button"
              onClick={() => setAddingAchievement(true)}
              className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-xs font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)] w-fit"
            >
              + Add Achievement
            </button>
          ) : (
            <div className="border border-[var(--color-border)] rounded-xl p-4 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-[var(--color-text-primary)]">New Achievement</h4>
              <div>
                <label className="text-[10px] text-[var(--color-text-muted)] block mb-1">Title</label>
                <input type="text" value={newAchievement.title} onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })} placeholder="e.g. Smart India Hackathon Winner" className="w-full px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-[var(--color-text-muted)] block mb-1">Description</label>
                <textarea value={newAchievement.description} onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })} placeholder="Details/Description" className="w-full px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none resize-none h-16" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-[var(--color-text-muted)] block mb-1">Date</label>
                  <input type="date" value={newAchievement.date} onChange={(e) => setNewAchievement({ ...newAchievement, date: e.target.value })} className="w-full px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--color-text-muted)] block mb-1">Document Upload</label>
                  {newAchievement.fileUrl ? (
                    <div className="text-[10px] text-emerald-400 font-medium py-2">✓ Upload Completed</div>
                  ) : (
                    <FileUploader
                      uploadUrl="/student/profile/upload-achievement"
                      fieldName="document"
                      accept="application/pdf, image/jpeg, image/png"
                      maxSizeMB={10}
                      onUploadComplete={(url) => setNewAchievement((a) => ({ ...a, fileUrl: url }))}
                    />
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-1 justify-end">
                <button type="button" onClick={() => setAddingAchievement(false)} className="px-3 py-1.5 border border-[var(--color-border)] text-xs rounded-lg hover:bg-[var(--color-bg-secondary)]">
                  Cancel
                </button>
                <button type="button" onClick={saveNewAchievement} className="px-3 py-1.5 bg-[var(--color-accent)] text-white text-xs rounded-lg hover:bg-[var(--color-accent-hover)] font-semibold">
                  Add to List
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button id="profile-save-btn" type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-4">
          {loading ? (
            <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Saving Changes...</>
          ) : 'Save Profile Details'}
        </button>

      </form>

      {/* ── 2-Step OTP Password Change Modal ────────────────────────────────────── */}
      {passModal.open && (
        <div id="password-modal" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-sm w-full p-6 relative">
            <button
              type="button"
              onClick={() => setPassModal((m) => ({ ...m, open: false }))}
              className="absolute right-4 top-4 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              ✕
            </button>

            {/* Success state */}
            {passModal.success ? (
              <div className="text-center py-6">
                <h3 className="text-lg font-bold text-emerald-400">✓ Password Changed</h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Closing in a moment...</p>
              </div>
            ) : (
              <>
                <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-4">Change Password</h3>

                {passModal.error && (
                  <div className="mb-4 px-3 py-2 rounded-lg bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-xs text-[var(--color-error)]">
                    {passModal.error}
                  </div>
                )}

                {/* Step 1: Request */}
                {passModal.step === 1 && (
                  <div className="flex flex-col gap-4 text-center">
                    <p className="text-xs text-[var(--color-text-secondary)]">To secure your account, a verification code will be sent to your registered college email.</p>
                    <button
                      type="button"
                      disabled={passModal.loading}
                      onClick={requestPasswordOTP}
                      className="btn-primary w-full text-xs py-2"
                    >
                      {passModal.loading ? 'Requesting...' : 'Request OTP Verification'}
                    </button>
                  </div>
                )}

                {/* Step 2: OTP Verify & Save */}
                {passModal.step === 2 && (
                  <form onSubmit={verifyPasswordOTP} className="flex flex-col gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Enter 6-Digit OTP</label>
                      <OtpInput
                        onComplete={(code) => setPassModal((m) => ({ ...m, otp: code }))}
                        onResend={requestPasswordOTP}
                        isLoading={passModal.loading}
                        attemptsRemaining={passModal.attempts}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[var(--color-text-secondary)]">New Password</label>
                      <input
                        type="password"
                        placeholder="Min 8 characters"
                        value={passModal.newPassword}
                        onChange={(e) => setPassModal((m) => ({ ...m, newPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[var(--color-text-secondary)]">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Retype password"
                        value={passModal.confirmPassword}
                        onChange={(e) => setPassModal((m) => ({ ...m, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={passModal.loading}
                      className="btn-primary w-full text-xs py-2"
                    >
                      {passModal.loading ? 'Verifying...' : 'Change Password'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
