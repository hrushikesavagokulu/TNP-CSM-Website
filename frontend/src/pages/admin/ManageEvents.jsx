import { useState, useEffect } from 'react';
import adminEventsService from '../../services/admin/events.service';

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [serviceAccountEmail, setServiceAccountEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    semester: '',
    description: '',
    batchLabel: '',
    driveFolderLink: '',
    expiresAt: '',
  });

  // Registrations Modal State
  const [viewRegistrationsEvent, setViewRegistrationsEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

  // Delete Confirmation Modal State
  const [deleteEventTarget, setDeleteEventTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copy share link feedback
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      const [emailData, eventsData] = await Promise.all([
        adminEventsService.getServiceAccountEmail(),
        adminEventsService.getEvents(),
      ]);

      if (emailData?.data?.email) {
        setServiceAccountEmail(emailData.data.email);
      }
      if (eventsData?.data) {
        setEvents(eventsData.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load events data.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      semester: '',
      description: '',
      batchLabel: '',
      driveFolderLink: '',
      expiresAt: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (evt) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title || '',
      semester: evt.semester || '',
      description: evt.description || '',
      batchLabel: evt.batchLabel || '',
      driveFolderLink: evt.driveRootFolderLink || '',
      expiresAt: evt.expiresAt ? new Date(evt.expiresAt).toISOString().slice(0, 16) : '',
    });
    setShowModal(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.semester || !formData.description || !formData.driveFolderLink) {
      setError('Please fill in all required fields (Title, Semester, Description, Drive Link).');
      return;
    }

    try {
      if (editingEvent) {
        await adminEventsService.updateEvent(editingEvent._id, formData);
        setSuccess('Event updated successfully!');
      } else {
        await adminEventsService.createEvent(formData);
        setSuccess('Event created successfully! Google Drive folder verified.');
      }
      setShowModal(false);
      fetchInitialData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event. Check Drive link permissions.');
    }
  };

  const handleCopyShareLink = async (evt) => {
    try {
      const linkData = await adminEventsService.getEventShareLink(evt._id);
      const shareUrl = linkData?.data?.shareableUrl || `${window.location.origin}/events/submit/${evt.shareableSlug}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(evt._id);
      setTimeout(() => setCopiedId(null), 3000);
    } catch {
      const fallbackUrl = `${window.location.origin}/events/submit/${evt.shareableSlug}`;
      await navigator.clipboard.writeText(fallbackUrl);
      setCopiedId(evt._id);
      setTimeout(() => setCopiedId(null), 3000);
    }
  };

  const handleViewRegistrations = async (evt) => {
    setViewRegistrationsEvent(evt);
    setLoadingRegs(true);
    try {
      const data = await adminEventsService.getEventRegistrations(evt._id);
      setRegistrations(data?.data?.registrations || []);
    } catch (err) {
      console.error('Failed to load registrations:', err);
    } finally {
      setLoadingRegs(false);
    }
  };

  const handleNonDestructiveZipDownload = async (evt) => {
    try {
      await adminEventsService.downloadEventZip(evt._id, evt.batchLabel || evt.title);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to download certificates zip.');
    }
  };

  const handleExecuteDelete = async () => {
    if (!deleteEventTarget) return;
    setIsDeleting(true);
    try {
      await adminEventsService.deleteEvent(
        deleteEventTarget._id,
        deleteEventTarget.batchLabel || deleteEventTarget.title
      );
      setSuccess('Event deleted. Certificate zip downloaded & files moved to Google Drive trash.');
      setDeleteEventTarget(null);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete operation failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in font-sans pb-16">
      
      {/* Top Header */}
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs font-bold text-[var(--color-accent)] uppercase tracking-widest">
            Events & Certificate Collection
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
            Manage Certificate Events
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Collect student certificates directly into organized Google Drive year folders (`Year-1`, `Year-2`, `Year-3`, `Year-4`).
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-[var(--color-accent)] text-[var(--color-text-inverse)] text-xs font-mono font-bold rounded-xl hover:bg-[var(--color-accent-hover)] transition-all flex items-center gap-2 shadow-sm"
        >
          <span>+ Create New Event</span>
        </button>
      </div>

      {/* Service Account Permission Banner */}
      <div className="glass-card p-5 border-l-4 border-amber-500 bg-amber-500/10 flex flex-col gap-2 text-xs">
        <div className="flex items-center gap-2 font-mono font-bold text-amber-500">
          <span>⚙️</span>
          <span>Google Drive Integration Prerequisite Setup:</span>
        </div>
        <p className="text-[var(--color-text-primary)] leading-relaxed">
          Before creating an event, share your target Google Drive folder with our app’s service account email as <strong>Editor</strong>:
        </p>
        <div className="inline-flex items-center gap-2 p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg font-mono text-xs font-bold text-[var(--color-accent)] w-fit">
          <span>📧</span>
          <span>{serviceAccountEmail || 'Loading service account email...'}</span>
        </div>
        <ol className="list-decimal list-inside text-[var(--color-text-muted)] space-y-1 font-mono text-[11px]">
          <li>Create a folder in your own Google Drive account.</li>
          <li>Share it with the service account email above as <strong>Editor</strong>.</li>
          <li>Paste the Google Drive folder link when creating the event below.</li>
        </ol>
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

      {/* Events Roster Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-[var(--color-text-primary)]">
            Active & Archived Certificate Collection Events ({events.length})
          </h2>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-xs text-[var(--color-text-secondary)]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] font-mono text-[10px] uppercase tracking-wide">
                <th className="p-4">Event Details</th>
                <th className="p-4 w-36 text-center">Semester</th>
                <th className="p-4 w-40 text-center">Submissions</th>
                <th className="p-4 w-36 text-center">Status</th>
                <th className="p-4 w-64 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]/60 bg-[var(--color-surface)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center font-mono text-xs text-[var(--color-text-muted)] italic">
                    Loading events...
                  </td>
                </tr>
              ) : events.length > 0 ? (
                events.map((evt) => (
                  <tr key={evt._id} className="hover:bg-[var(--color-surface-raised)] transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-[var(--color-text-primary)] text-sm">
                          {evt.title}
                        </span>
                        <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-2">
                          {evt.description}
                        </p>
                        {evt.batchLabel && (
                          <span className="text-[10px] font-mono font-bold text-[var(--color-accent)]">
                            Batch Label: {evt.batchLabel}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-center font-mono text-xs font-bold text-[var(--color-text-primary)]">
                      {evt.semester}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleViewRegistrations(evt)}
                        className="inline-flex flex-col items-center hover:opacity-80 transition-opacity"
                      >
                        <span className="text-sm font-bold text-[var(--color-accent)] font-mono">
                          {evt.registrationCount || 0} Students
                        </span>
                        <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                          ({evt.certificateCount || 0} Certs)
                        </span>
                      </button>
                    </td>

                    <td className="p-4 text-center font-mono">
                      {evt.isClosed ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30">
                          Closed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                          Active Collection
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-1.5 font-mono text-[10px]">
                        {/* Open in Drive */}
                        <a
                          href={evt.driveRootFolderLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-bold rounded-lg hover:border-[var(--color-accent)] transition-all no-underline"
                          title="Open folder in Google Drive"
                        >
                          Drive ↗
                        </a>

                        {/* Copy Link */}
                        <button
                          onClick={() => handleCopyShareLink(evt)}
                          className="px-2.5 py-1 bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-[var(--color-accent)] font-bold rounded-lg hover:bg-[var(--color-accent-subtle)] transition-all"
                        >
                          {copiedId === evt._id ? 'Copied ✓' : 'Copy Link'}
                        </button>

                        {/* Download Zip */}
                        <button
                          onClick={() => handleNonDestructiveZipDownload(evt)}
                          className="px-2.5 py-1 bg-emerald-600/10 border border-emerald-500/30 text-emerald-500 font-bold rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                          title="Download Zip of all certificates (non-destructive)"
                        >
                          Zip ⬇
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEditModal(evt)}
                          className="px-2 py-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                        >
                          Edit
                        </button>

                        {/* Delete Event */}
                        <button
                          onClick={() => setDeleteEventTarget(evt)}
                          className="px-2 py-1 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                          title="Zip & move files to Drive trash"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center font-mono text-xs text-[var(--color-text-muted)] italic">
                    No certificate collection events found. Create your first event above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT EVENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)]">
                {editingEvent ? 'Edit Event' : 'Create Certificate Collection Event'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-5 flex flex-col gap-4 text-xs font-mono">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[var(--color-text-muted)] mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Certification Drive 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--color-text-muted)] mb-1">
                    Semester / Academic Term *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VI Semester"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full p-2.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--color-text-muted)] mb-1">
                    Batch Label (For Zip Naming)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2026_AWS_Certs"
                    value={formData.batchLabel}
                    onChange={(e) => setFormData({ ...formData, batchLabel: e.target.value })}
                    className="w-full p-2.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[var(--color-text-muted)] mb-1">
                  Google Drive Folder Link * (Shared with {serviceAccountEmail || 'service account'})
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={formData.driveFolderLink}
                  onChange={(e) => setFormData({ ...formData, driveFolderLink: e.target.value })}
                  className="w-full p-2.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:border-[var(--color-accent)]"
                />
                <span className="text-[10px] text-[var(--color-text-muted)] mt-1 block">
                  Subfolders (`Year-1`, `Year-2`, `Year-3`, `Year-4`) will be automatically created inside this Drive folder.
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[var(--color-text-muted)] mb-1">
                  Event Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Instructions for students regarding certificate submission..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)] font-bold hover:bg-[var(--color-surface-raised)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-text-inverse)] rounded-lg font-bold hover:bg-[var(--color-accent-hover)]"
                >
                  Verify Access & Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SUBMISSIONS MODAL */}
      {viewRegistrationsEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-4xl max-h-[85vh] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)]">
                  Student Submissions — {viewRegistrationsEvent.title}
                </h3>
                <span className="text-[10px] font-mono text-[var(--color-accent)]">
                  {registrations.length} Students Registered
                </span>
              </div>
              <button
                onClick={() => setViewRegistrationsEvent(null)}
                className="text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              {loadingRegs ? (
                <div className="p-8 text-center font-mono text-xs text-[var(--color-text-muted)]">
                  Loading student registrations...
                </div>
              ) : registrations.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {registrations.map((reg) => (
                    <div key={reg._id} className="p-4 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg-secondary)]/40 flex flex-col gap-2 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[var(--color-text-primary)] text-sm">{reg.submittedName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-bold">
                            {reg.submittedRollNo}
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--color-text-muted)]">
                          Year: {reg.submittedYear} | Sec: {reg.submittedSection}
                        </span>
                      </div>

                      <div className="text-[11px] text-[var(--color-text-muted)]">
                        📧 {reg.submittedEmail}
                      </div>

                      {reg.certificates?.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-[var(--color-border)]/50">
                          {reg.certificates.map((cert) => {
                            const isFallback = cert.isFallback || cert.driveFileId?.startsWith('minio-');
                            return (
                              <div key={cert._id} className="flex items-center gap-1">
                                <a
                                  href={cert.driveFileLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-accent)] font-bold flex items-center gap-1.5 hover:border-[var(--color-accent)] transition-all text-[11px] no-underline"
                                >
                                  <span>📄 {cert.certificateName}</span>
                                  <span className="text-[9px] text-[var(--color-text-muted)]">↗</span>
                                </a>
                                {isFallback && (
                                  <span
                                    className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30"
                                    title="Personal Google Drive 0-byte service account quota limit hit. Stored safely via MinIO fallback."
                                  >
                                    ⚠️ Fallback storage
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-[11px] italic text-[var(--color-text-muted)] mt-1">
                          No certificates uploaded yet.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center font-mono text-xs text-[var(--color-text-muted)] italic">
                  No students have submitted information for this event yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HONEST DELETE CONFIRMATION MODAL */}
      {deleteEventTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-danger)]/40 rounded-2xl shadow-2xl overflow-hidden p-6 flex flex-col gap-4 font-mono text-xs">
            <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
              <span>⚠️</span>
              <h3>Confirm Event Deletion</h3>
            </div>

            <p className="text-[var(--color-text-primary)] leading-relaxed">
              Are you sure you want to delete <strong>{deleteEventTarget.title}</strong>?
            </p>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-600 leading-relaxed text-[11px]">
              ℹ️ <strong>Honest Storage Retention Notice:</strong><br />
              This action will download a complete ZIP file of all submitted certificates organized by year, and then move the certificates and year subfolders to <strong>YOUR Google Drive trash</strong>. Files remain recoverable from your Drive trash for Google's standard retention period unless you manually empty it yourself.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteEventTarget(null)}
                className="px-4 py-2 border border-[var(--color-border)] rounded-lg font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)]"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleExecuteDelete}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? 'Zipping & Trashing...' : 'Download Zip & Move to Trash'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
