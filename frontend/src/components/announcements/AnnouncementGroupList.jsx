import { useState, useEffect, useCallback } from 'react';
import announcementService from '../../services/announcement.service';

/**
 * AnnouncementGroupList — Student-facing announcement inbox sidebar.
 *
 * Renders:
 *   1. "General" group (always first)
 *   2. "Year N" group
 *   3. One entry per batch the student belongs to (real batch names, never hardcoded)
 *
 * Unread badges are live (re-fetched when selectedGroup changes or when a
 * socket event triggers a refresh via the onRefresh prop).
 *
 * Props:
 *   selectedGroup  - currently selected groupId string
 *   onSelectGroup  - (groupId) => void
 *   refreshTrigger - increment this to force a re-fetch (e.g. after socket event)
 */
export default function AnnouncementGroupList({ selectedGroup, onSelectGroup, refreshTrigger }) {
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchGroups = useCallback(async () => {
    try {
      const data = await announcementService.getGroups();
      setGroups(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load groups.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups, refreshTrigger]);

  const typeIcon = (type) => {
    if (type === 'general') return '🌐';
    if (type === 'year')    return '📅';
    return '👥';
  };

  if (loading) {
    return (
      <div className="announcement-groups-skeleton">
        {[1, 2, 3].map((i) => (
          <div key={i} className="announcement-group-skeleton-item" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="announcement-groups-error">
        <p>{error}</p>
        <button onClick={fetchGroups}>Retry</button>
      </div>
    );
  }

  return (
    <div className="announcement-groups">
      <p className="announcement-groups-label">Announcement Channels</p>
      <ul className="announcement-groups-list">
        {groups.map((group) => {
          const isActive = selectedGroup === group.groupId;
          return (
            <li key={group.groupId}>
              <button
                id={`announcement-group-${group.groupId}`}
                className={`announcement-group-item${isActive ? ' active' : ''}`}
                onClick={() => onSelectGroup(group.groupId)}
                aria-pressed={isActive}
              >
                <span className="announcement-group-icon">{typeIcon(group.type)}</span>
                <span className="announcement-group-name">{group.label}</span>
                {group.unreadCount > 0 && (
                  <span className="announcement-unread-badge">
                    {group.unreadCount > 99 ? '99+' : group.unreadCount}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <style>{`
        .announcement-groups { padding: 0.5rem 0; }

        .announcement-groups-label {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--color-text-muted);
          padding: 0 1rem 0.5rem;
          margin: 0;
        }

        .announcement-groups-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .announcement-group-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          width: 100%;
          padding: 0.6rem 1rem;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }

        .announcement-group-item:hover {
          background: var(--color-accent-subtle);
          color: var(--color-text-primary);
        }

        .announcement-group-item.active {
          background: var(--color-accent);
          color: #000;
          font-weight: 700;
        }

        .announcement-group-icon { font-size: 0.9rem; flex-shrink: 0; }
        .announcement-group-name { flex: 1; }

        .announcement-unread-badge {
          background: var(--color-error);
          color: #fff;
          font-size: 0.6rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 999px;
          min-width: 18px;
          text-align: center;
          flex-shrink: 0;
        }

        .announcement-group-item.active .announcement-unread-badge {
          background: rgba(0,0,0,0.25);
          color: #fff;
        }

        .announcement-groups-skeleton {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 0.5rem 1rem;
        }

        .announcement-group-skeleton-item {
          height: 36px;
          border-radius: 10px;
          background: var(--color-surface-raised);
          animation: skeleton-pulse 1.4s ease-in-out infinite;
        }

        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        .announcement-groups-error {
          padding: 1rem;
          color: var(--color-error);
          font-size: 0.8rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .announcement-groups-error button {
          background: var(--color-error);
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 4px 12px;
          font-size: 0.75rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
