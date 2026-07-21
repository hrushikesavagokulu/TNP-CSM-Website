import { useState } from 'react';
import api from '../../services/api';

/**
 * RoadmapChecklistItem — checkbox + skill-group label for a single roadmap item.
 * Optimistically updates local state and rolls back on API failure.
 */
export default function RoadmapChecklistItem({ item, userId, userChecklist = [], onUpdate }) {
  const checklistEntry = userChecklist.find((c) => c.itemId === item._id);
  const [done, setDone]   = useState(checklistEntry?.done ?? false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation();
    const optimistic = !done;
    setDone(optimistic);
    setLoading(true);
    try {
      const res = await api.patch(`/student/roadmap-checklist/${item._id}`);
      const updated = res.data.data;
      setDone(updated.done);
      if (onUpdate) onUpdate(updated.completionPercent);
    } catch (err) {
      // Rollback on failure
      setDone(!optimistic);
      console.error('[Checklist] Toggle failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center gap-3 select-none ${loading ? 'opacity-60' : ''}`}
    >
      <input
        type="checkbox"
        checked={done}
        onChange={handleToggle}
        disabled={loading}
        className="w-4 h-4 rounded accent-[var(--color-accent)] cursor-pointer"
      />
      <div className="flex items-center gap-2 cursor-pointer" onClick={handleToggle}>
        <span className={`text-sm font-bold transition-all ${done ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text-primary)]'}`}>
          {item.skillGroupName}
        </span>
        {item.mandatory && (
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            Mandatory Skill
          </span>
        )}
        {done && (
          <span className="text-xs font-bold text-emerald-400">✓ Completed</span>
        )}
      </div>
    </div>
  );
}
