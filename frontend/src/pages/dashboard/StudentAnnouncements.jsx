import { useState, useEffect, useCallback, useRef } from 'react';
import AnnouncementGroupList from '../../components/announcements/AnnouncementGroupList';
import announcementService from '../../services/announcement.service';

// ── Announcement Card ─────────────────────────────────────────────────────────
function AnnouncementCard({ ann, onRead, onImageClick }) {
  const [expanded, setExpanded] = useState(false);

  const handleExpand = () => {
    setExpanded((v) => !v);
    if (!ann.isRead) onRead(ann._id);
  };

  const formattedDate = ann.postedAt
    ? new Date(ann.postedAt).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '';

  const targetLabel = () => {
    if (ann.isGeneral) return '🌐 General';
    const parts = [];
    if (ann.targetYears?.length)   parts.push(`Year ${ann.targetYears.join(', ')}`);
    if (ann.targetBatches?.length) parts.push(ann.targetBatches.map((b) => b.name || 'Batch').join(', '));
    return parts.join(' · ') || 'Specific group';
  };

  return (
    <article
      className={`ann-card ${ann.isRead ? 'ann-read' : 'ann-unread'}`}
      onClick={handleExpand}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleExpand()}
    >
      <div className="ann-card-header">
        <div className="ann-card-meta">
          {!ann.isRead && <span className="ann-new-dot" aria-label="Unread" />}
          <span className="ann-target-badge">{targetLabel()}</span>
          <span className="ann-date">{formattedDate}</span>
        </div>
        <h2 className="ann-title">{ann.title}</h2>
        {ann.postedBy?.name && (
          <p className="ann-author">Posted by {ann.postedBy.name}</p>
        )}
      </div>

      {expanded && (
        <div className="ann-body">
          <p>{ann.body}</p>
          
          {ann.attachments?.length > 0 && (
            <div className="ann-attachments">
              {/* Media gallery grid for images */}
              {ann.attachments.some(att => att.mimeType?.startsWith('image/')) && (
                <div className="ann-media-grid">
                  {ann.attachments
                    .filter(att => att.mimeType?.startsWith('image/'))
                    .map((att, i) => (
                      <div 
                        key={i} 
                        className="ann-media-thumbnail"
                        onClick={(e) => {
                          e.stopPropagation();
                          onImageClick(att.url);
                        }}
                      >
                        <img src={att.url} alt={att.filename || 'Attachment'} />
                        <div className="ann-media-overlay">🔍 Click to zoom</div>
                      </div>
                    ))}
                </div>
              )}

              {/* Video elements */}
              {ann.attachments.some(att => att.mimeType?.startsWith('video/')) && (
                <div className="ann-videos-list">
                  {ann.attachments
                    .filter(att => att.mimeType?.startsWith('video/'))
                    .map((att, i) => (
                      <div key={i} className="ann-video-wrapper" onClick={(e) => e.stopPropagation()}>
                        <video src={att.url} controls className="ann-video-player" />
                        <span className="ann-video-title">🎥 {att.filename}</span>
                      </div>
                    ))}
                </div>
              )}

              {/* Document download buttons */}
              {ann.attachments.some(att => !att.mimeType?.startsWith('image/') && !att.mimeType?.startsWith('video/')) && (
                <div className="ann-docs-list">
                  <p className="ann-attach-label">Documents & files:</p>
                  <div className="ann-docs-grid">
                    {ann.attachments
                      .filter(att => !att.mimeType?.startsWith('image/') && !att.mimeType?.startsWith('video/'))
                      .map((att, i) => (
                        <a
                          key={i}
                          href={att.url}
                          download={att.filename}
                          className="ann-doc-download-btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="ann-doc-icon">💾</span>
                          <span className="ann-doc-name">{att.filename}</span>
                        </a>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="ann-card-footer">
        <span className="ann-expand-hint">
          {expanded ? '▲ Collapse' : '▼ Click to read'}
        </span>
      </div>
    </article>
  );
}

// ── Main Announcements Page ───────────────────────────────────────────────────
export default function StudentAnnouncements() {
  const [selectedGroup, setSelectedGroup]     = useState('general');
  const [announcements, setAnnouncements]     = useState([]);
  const [pagination, setPagination]           = useState(null);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState(null);
  const [page, setPage]                       = useState(1);
  const [refreshTrigger, setRefreshTrigger]   = useState(0);
  const [lightboxImage, setLightboxImage]     = useState(null);
  const listRef = useRef(null);

  const fetchAnnouncements = useCallback(async (groupId, pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await announcementService.getAnnouncements(groupId, { page: pageNum, limit: 15 });
      setAnnouncements(data.announcements);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchAnnouncements(selectedGroup, 1);
    // Scroll to top of list when group changes
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [selectedGroup, fetchAnnouncements]);

  useEffect(() => {
    fetchAnnouncements(selectedGroup, page);
  }, [page]); // eslint-disable-line

  const handleSelectGroup = (groupId) => {
    setSelectedGroup(groupId);
  };

  const handleMarkRead = async (id) => {
    try {
      await announcementService.markAsRead(id);
      // Optimistically update local state
      setAnnouncements((prev) =>
        prev.map((a) => (a._id === id ? { ...a, isRead: true } : a))
      );
      // Trigger sidebar unread count refresh
      setRefreshTrigger((t) => t + 1);
    } catch {
      // Silently ignore mark-read errors
    }
  };

  return (
    <div className="student-ann-page">
      {/* ── Sidebar: Group List ─────────────────────────────────────────────── */}
      <aside className="ann-sidebar">
        <AnnouncementGroupList
          selectedGroup={selectedGroup}
          onSelectGroup={handleSelectGroup}
          refreshTrigger={refreshTrigger}
        />
      </aside>

      {/* ── Main Feed ──────────────────────────────────────────────────────── */}
      <main className="ann-feed" ref={listRef}>
        <div className="ann-feed-header">
          <h1 className="ann-feed-title">
            {selectedGroup === 'general' && '🌐 General Announcements'}
            {selectedGroup.startsWith('year-') && `📅 Year ${selectedGroup.replace('year-', '')} Announcements`}
            {selectedGroup.startsWith('batch-') && '👥 Batch Announcements'}
          </h1>
          {pagination && (
            <span className="ann-count">{pagination.total} announcement{pagination.total !== 1 ? 's' : ''}</span>
          )}
        </div>

        {loading ? (
          <div className="ann-skeleton-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="ann-skeleton-card" />
            ))}
          </div>
        ) : error ? (
          <div className="ann-error-box">
            <p>{error}</p>
            <button onClick={() => fetchAnnouncements(selectedGroup, page)}>Retry</button>
          </div>
        ) : announcements.length === 0 ? (
          <div className="ann-empty-box">
            <div className="ann-empty-icon">🔔</div>
            <p className="ann-empty-text">No announcements yet in this channel.</p>
            <p className="ann-empty-hint">Check back later — the admin will post updates here.</p>
          </div>
        ) : (
          <>
            <div className="ann-list">
              {announcements.map((ann) => (
                <AnnouncementCard
                  key={ann._id}
                  ann={ann}
                  onRead={handleMarkRead}
                  onImageClick={(url) => setLightboxImage(url)}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="ann-pagination">
                <button
                  className="ann-page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Prev
                </button>
                <span className="ann-page-info">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  className="ann-page-btn"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Lightbox zoom modal */}
      {lightboxImage && (
        <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <button className="lightbox-close" onClick={() => setLightboxImage(null)}>✕ Close</button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImage} alt="Zoomed View" />
          </div>
        </div>
      )}


      <style>{`
        /* ── Layout ── */
        .student-ann-page {
          display: flex;
          gap: 0;
          height: calc(100vh - 4rem);
          overflow: hidden;
          background: var(--color-bg);
        }

        /* ── Sidebar ── */
        .ann-sidebar {
          width: 240px;
          flex-shrink: 0;
          border-right: 1px solid var(--color-border);
          background: var(--color-surface);
          overflow-y: auto;
          padding: 1rem 0;
          scrollbar-width: thin;
        }

        /* ── Feed ── */
        .ann-feed {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem 2rem;
          scrollbar-width: thin;
        }

        @media (max-width: 768px) {
          .student-ann-page {
            flex-direction: column;
            height: auto;
            overflow: visible;
          }
          .ann-sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid var(--color-border);
            padding: 0.5rem 0;
            overflow-y: visible;
          }
          .ann-feed {
            padding: 1rem;
            overflow-y: visible;
          }
        }

        /* ── Feed Header ── */
        .ann-feed-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .ann-feed-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--color-text-primary);
          margin: 0;
        }
        .ann-count {
          font-size: 0.7rem;
          color: var(--color-text-muted);
          background: var(--color-surface-raised);
          border: 1px solid var(--color-border);
          padding: 2px 10px;
          border-radius: 999px;
          font-weight: 600;
        }

        /* ── Announcement Card ── */
        .ann-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 14px;
          padding: 1.1rem 1.3rem;
          margin-bottom: 0.75rem;
          cursor: pointer;
          transition: all 0.18s ease;
          position: relative;
          outline: none;
        }
        .ann-card:hover, .ann-card:focus-visible {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 2px var(--color-accent-subtle);
          transform: translateY(-1px);
        }
        .ann-card.ann-unread {
          border-left: 3px solid var(--color-accent);
          background: color-mix(in srgb, var(--color-accent) 5%, var(--color-surface));
        }
        .ann-card.ann-read {
          opacity: 0.85;
        }

        /* ── Card Header ── */
        .ann-card-header { display: flex; flex-direction: column; gap: 0.35rem; }
        .ann-card-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .ann-new-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--color-accent);
          flex-shrink: 0;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .ann-target-badge {
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          padding: 2px 8px;
          border-radius: 999px;
          background: var(--color-accent-subtle);
          color: var(--color-accent);
          border: 1px solid var(--color-accent-border, var(--color-border));
        }
        .ann-date {
          font-size: 0.68rem;
          color: var(--color-text-muted);
          margin-left: auto;
        }
        .ann-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
          line-height: 1.4;
        }
        .ann-author {
          font-size: 0.7rem;
          color: var(--color-text-muted);
          margin: 0;
        }

        /* ── Card Body (expanded) ── */
        .ann-body {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--color-border);
        }
        .ann-body p {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          line-height: 1.7;
          margin: 0;
          white-space: pre-wrap;
        }
        .ann-attachments { margin-top: 0.75rem; }
        .ann-attach-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.35rem;
        }
        .ann-media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }

        .ann-media-thumbnail {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--color-border);
          cursor: zoom-in;
          background: var(--color-bg-secondary);
        }

        .ann-media-thumbnail img {
          width: 100%;
          height: 100%;
          object-cover: cover;
          transition: transform 0.25s ease;
        }

        .ann-media-thumbnail:hover img {
          transform: scale(1.05);
        }

        .ann-media-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          color: #fff;
          font-size: 0.65rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .ann-media-thumbnail:hover .ann-media-overlay {
          opacity: 1;
        }

        .ann-videos-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }

        .ann-video-wrapper {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-width: 480px;
        }

        .ann-video-player {
          width: 100%;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background: #000;
        }

        .ann-video-title {
          font-size: 0.72rem;
          color: var(--color-text-muted);
        }

        .ann-docs-list {
          margin-top: 1rem;
        }

        .ann-docs-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 0.5rem;
        }

        .ann-doc-download-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-accent);
          background: var(--color-accent-subtle);
          border: 1px solid var(--color-accent-border);
          padding: 8px 14px;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .ann-doc-download-btn:hover {
          background: var(--color-accent);
          color: var(--color-text-inverse, #fff);
          border-color: var(--color-accent);
          transform: translateY(-1px);
        }

        .lightbox-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(10, 15, 30, 0.9);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: zoom-out;
          animation: fade-in 0.25s ease;
        }

        .lightbox-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
          border: none;
          font-size: 0.9rem;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.15s;
        }

        .lightbox-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .lightbox-content {
          max-width: 90%;
          max-height: 85%;
          box-shadow: 0 24px 64px rgba(0,0,0,0.5);
          border-radius: 12px;
          overflow: hidden;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
        }

        .lightbox-content img {
          max-width: 100%;
          max-height: 80vh;
          display: block;
          object-fit: contain;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* ── Card Footer ── */
        .ann-card-footer {
          margin-top: 0.6rem;
          text-align: right;
        }
        .ann-expand-hint {
          font-size: 0.65rem;
          color: var(--color-text-muted);
          font-weight: 600;
          letter-spacing: 0.04em;
        }


        /* ── Skeleton Loading ── */
        .ann-skeleton-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .ann-skeleton-card {
          height: 90px;
          border-radius: 14px;
          background: var(--color-surface-raised, var(--color-surface));
          border: 1px solid var(--color-border);
          animation: skeleton-pulse 1.4s ease-in-out infinite;
        }
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        /* ── Error Box ── */
        .ann-error-box {
          padding: 1.5rem;
          border-radius: 12px;
          background: color-mix(in srgb, var(--color-error, #f62440) 8%, var(--color-surface));
          border: 1px solid var(--color-error, #f62440);
          color: var(--color-error, #f62440);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .ann-error-box button {
          background: var(--color-error, #f62440);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 6px 16px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
        }

        /* ── Empty State ── */
        .ann-empty-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          gap: 0.75rem;
        }
        .ann-empty-icon { font-size: 3rem; }
        .ann-empty-text {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }
        .ann-empty-hint {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin: 0;
        }

        /* ── Pagination ── */
        .ann-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1.5rem 0;
        }
        .ann-page-btn {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
          padding: 6px 18px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .ann-page-btn:hover:not(:disabled) {
          border-color: var(--color-accent);
          color: var(--color-accent);
        }
        .ann-page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .ann-page-info {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
