import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import eventService from '../../services/event.service';
import { useAuth } from '../../context/AuthContext';

export default function SubmitCertificates() {
  const { shareableSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [eventsList, setEventsList] = useState([]);
  const [event, setEvent] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Student Info Form State
  const [infoForm, setInfoForm] = useState({
    submittedName: '',
    submittedRollNo: '',
    submittedEmail: '',
    submittedSection: '',
    submittedYear: '1',
  });

  // Certificate Upload State
  const [certificateName, setCertificateName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Pre-fill user profile info if logged in
  useEffect(() => {
    if (user) {
      setInfoForm({
        submittedName: user.name || '',
        submittedRollNo: user.rollNo || '',
        submittedEmail: user.email || '',
        submittedSection: user.section || 'A',
        submittedYear: user.year ? String(user.year) : '1',
      });
    }
  }, [user]);

  const loadSubmissionForEvent = async (selectedEvt) => {
    if (!selectedEvt || !user) return;
    try {
      const subData = await eventService.getMySubmission(selectedEvt._id);
      if (subData?.data) {
        setSubmission(subData.data);
        setInfoForm({
          submittedName: subData.data.submittedName,
          submittedRollNo: subData.data.submittedRollNo,
          submittedEmail: subData.data.submittedEmail,
          submittedSection: subData.data.submittedSection,
          submittedYear: subData.data.submittedYear,
        });
      } else {
        setSubmission(null);
      }
    } catch {
      setSubmission(null);
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (shareableSlug) {
        // Direct event by slug
        const eventData = await eventService.getEventBySlug(shareableSlug);
        const evt = eventData?.data;
        setEvent(evt);
        if (evt) {
          await loadSubmissionForEvent(evt);
        }
      } else {
        // Load all open events for student
        const listData = await eventService.getStudentEvents();
        const list = listData?.data || [];
        setEventsList(list);

        // If list has events, default select the first event
        if (list.length > 0) {
          setEvent(list[0]);
          await loadSubmissionForEvent(list[0]);
        } else {
          setEvent(null);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load event data.');
    } finally {
      setLoading(false);
    }
  }, [shareableSlug, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectEvent = async (selectedEvt) => {
    setEvent(selectedEvt);
    setError('');
    setSuccess('');
    await loadSubmissionForEvent(selectedEvt);
  };

  const handleSubmitInfo = async (e) => {
    e.preventDefault();
    if (!event) return;
    setError('');
    setSuccess('');

    try {
      const res = await eventService.submitStudentInfo(event._id, infoForm);
      setSubmission(res.data);
      setSuccess('Student details saved successfully! You may now upload your certificates below.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save student info.');
    }
  };

  const handleUploadCertificate = async (e) => {
    e.preventDefault();
    if (!event || !selectedFile || !certificateName.trim()) {
      setError('Please provide a certificate name and select a file.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const res = await eventService.uploadCertificate(event._id, certificateName.trim(), selectedFile);
      setSubmission(res.data);
      setCertificateName('');
      setSelectedFile(null);
      setSuccess('Certificate uploaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCert = async (certId) => {
    if (!event || !window.confirm('Remove this certificate? File will be moved to Google Drive trash.')) return;
    setError('');
    setSuccess('');

    try {
      const res = await eventService.deleteSingleCertificate(event._id, certId);
      setSubmission(res.data);
      setSuccess('Certificate removed successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove certificate.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-mono text-xs text-[var(--color-text-muted)]">
        Loading certificate collection portal...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 flex flex-col gap-8 animate-fade-in font-sans pb-16">
      
      {/* Top Header */}
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs font-bold text-[var(--color-accent)] uppercase tracking-widest">
            Placement & Department Events
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
            Event Certificate Collection
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Register and submit your achievements & certificates for active department drives.
          </p>
        </div>
      </div>

      {/* Events Selector Bar / Cards (If multiple events exist) */}
      {!shareableSlug && eventsList.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-mono text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
            Active Certificate Drives ({eventsList.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {eventsList.map((evt) => (
              <button
                key={evt._id}
                onClick={() => handleSelectEvent(evt)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  event?._id === evt._id
                    ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)] shadow-sm'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent-border)]'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] font-bold text-[var(--color-accent)] uppercase">
                    {evt.semester}
                  </span>
                  <h3 className="font-bold text-xs text-[var(--color-text-primary)] line-clamp-1">
                    {evt.title}
                  </h3>
                  <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-2">
                    {evt.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[var(--color-text-muted)] font-bold">
                    {event?._id === evt._id ? '✓ Selected' : 'Click to Select'}
                  </span>
                  <span className="text-[var(--color-accent)]">↗</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Event Details & Submission Form */}
      {event ? (
        <div className="flex flex-col gap-6">
          {/* Event Banner */}
          <div className="glass-card p-6 border-l-4 border-[var(--color-accent)] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[var(--color-accent)] font-bold uppercase tracking-wider">
                🎓 {event.semester} • Active Drive
              </span>
              {event.isClosed && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30">
                  Closed
                </span>
              )}
            </div>
            <h2 className="font-display text-xl font-extrabold text-[var(--color-text-primary)]">
              {event.title}
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mt-1">
              {event.description}
            </p>
          </div>

          {error && (
            <div className="glass-card p-4 border border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] text-xs text-[var(--color-danger)] font-mono">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="glass-card p-4 border border-[var(--color-success)]/30 bg-[var(--color-success-bg)] text-xs text-[var(--color-success)] font-mono">
              ✅ {success}
            </div>
          )}

          {/* Step 1: Student Information Snapshot */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)]">
                Step 1: Student Registration Snapshot
              </h3>
              {submission && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-bold">
                  ✓ Registered
                </span>
              )}
            </div>

            <form onSubmit={handleSubmitInfo} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[var(--color-text-muted)] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  disabled={event.isClosed}
                  placeholder="e.g. Hrushikesava Gokulu"
                  value={infoForm.submittedName}
                  onChange={(e) => setInfoForm({ ...infoForm, submittedName: e.target.value })}
                  className="w-full p-2.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:border-[var(--color-accent)] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[var(--color-text-muted)] mb-1">
                  Roll Number *
                </label>
                <input
                  type="text"
                  required
                  disabled={event.isClosed}
                  placeholder="e.g. 239X1A3281"
                  value={infoForm.submittedRollNo}
                  onChange={(e) => setInfoForm({ ...infoForm, submittedRollNo: e.target.value })}
                  className="w-full p-2.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:border-[var(--color-accent)] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[var(--color-text-muted)] mb-1">
                  College Email *
                </label>
                <input
                  type="email"
                  required
                  disabled={event.isClosed}
                  placeholder="e.g. student@gprec.ac.in"
                  value={infoForm.submittedEmail}
                  onChange={(e) => setInfoForm({ ...infoForm, submittedEmail: e.target.value })}
                  className="w-full p-2.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:border-[var(--color-accent)] disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--color-text-muted)] mb-1">
                    Academic Year *
                  </label>
                  <select
                    disabled={event.isClosed}
                    value={infoForm.submittedYear}
                    onChange={(e) => setInfoForm({ ...infoForm, submittedYear: e.target.value })}
                    className="w-full p-2.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg focus:outline-none"
                  >
                    <option value="1">Year I</option>
                    <option value="2">Year II</option>
                    <option value="3">Year III</option>
                    <option value="4">Year IV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--color-text-muted)] mb-1">
                    Section *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={event.isClosed}
                    placeholder="e.g. CSM-A"
                    value={infoForm.submittedSection}
                    onChange={(e) => setInfoForm({ ...infoForm, submittedSection: e.target.value })}
                    className="w-full p-2.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:border-[var(--color-accent)] disabled:opacity-60"
                  />
                </div>
              </div>

              {!event.isClosed && (
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[var(--color-accent)] text-[var(--color-text-inverse)] font-bold rounded-xl hover:bg-[var(--color-accent-hover)] transition-all"
                  >
                    {submission ? 'Update Registration Info' : 'Save Information & Register'}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Step 2: Upload Repeatable Certificates */}
          {submission && (
            <div className="glass-card p-6 flex flex-col gap-6">
              <div className="border-b border-[var(--color-border)] pb-3">
                <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)]">
                  Step 2: Upload Event Certificates
                </h3>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 font-mono">
                  Certificates will be stored under your year subfolder (`Year-{submission.submittedYear}`).
                </p>
              </div>

              {!event.isClosed && (
                <form onSubmit={handleUploadCertificate} className="flex flex-col gap-4 text-xs font-mono bg-[var(--color-bg-secondary)]/40 p-4 rounded-xl border border-[var(--color-border)]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[var(--color-text-muted)] mb-1">
                        Certificate Name / Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. AWS Cloud Practitioner Certificate"
                        value={certificateName}
                        onChange={(e) => setCertificateName(e.target.value)}
                        className="w-full p-2.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[var(--color-text-muted)] mb-1">
                        Select File (PDF or Image, max 10MB) *
                      </label>
                      <input
                        type="file"
                        required
                        accept="image/*,.pdf"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="w-full p-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={uploading}
                      className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {uploading ? 'Uploading Certificate...' : '⬆ Upload Certificate'}
                    </button>
                  </div>
                </form>
              )}

              {/* Uploaded Certificates Roster */}
              <div>
                <h4 className="font-mono text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                  Your Submitted Certificates ({submission.certificates?.length || 0})
                </h4>

                {submission.certificates?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {submission.certificates.map((cert) => (
                      <div
                        key={cert._id}
                        className="p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] flex items-center justify-between gap-3 font-mono text-xs"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-base">{cert.fileType === 'pdf' ? '📄' : '🖼️'}</span>
                          <a
                            href={cert.driveFileLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[var(--color-accent)] truncate hover:underline text-xs"
                          >
                            {cert.certificateName} ↗
                          </a>
                        </div>

                        {!event.isClosed && (
                          <button
                            onClick={() => handleDeleteCert(cert._id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all text-xs"
                            title="Remove certificate"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center font-mono text-xs text-[var(--color-text-muted)] italic border border-dashed border-[var(--color-border)] rounded-xl">
                    No certificates uploaded yet for this event.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center glass-card font-mono text-xs text-[var(--color-text-muted)] italic">
          No active certificate collection drives available at this time.
        </div>
      )}

    </div>
  );
}
