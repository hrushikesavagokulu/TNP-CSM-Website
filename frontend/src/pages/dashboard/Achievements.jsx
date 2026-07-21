import { useState, useEffect, useCallback } from 'react';
import achievementService from '../../services/achievement.service';
import ContentBlockRenderer from '../../components/shared/ContentBlockRenderer';

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [search, setSearch]             = useState('');
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);
  const [pagination, setPagination]     = useState(null);

  const fetchAchievements = useCallback(async (querySearch, queryPage) => {
    setLoading(true);
    try {
      const res = await achievementService.getAchievements(querySearch, queryPage);
      setAchievements(res.data || []);
      setPagination(res.pagination || null);
    } catch (err) {
      console.error('[Achievements] Error fetching feed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAchievements(search, 1);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchAchievements]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12 max-w-5xl mx-auto">
      {/* Top Banner Header */}
      <div className="glass-card p-6 border border-[var(--color-border)] bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-bg-secondary)]/40 to-[var(--color-surface)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 text-white flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
            🏅
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--color-text-primary)]">
              Department Achievements & Spotlights
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Celebrating excellence, awards, student milestones, and CSM department recognitions.
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="glass-card p-3 border border-[var(--color-border)] flex items-center gap-3">
        <span className="text-base px-2">🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search achievements by title, student name, or keyword..."
          className="flex-1 bg-transparent border-none text-xs text-[var(--color-text-primary)] focus:outline-none font-medium placeholder-[var(--color-text-muted)]"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-xs text-[var(--color-text-muted)] hover:text-red-400 font-bold px-2">
            Clear
          </button>
        )}
      </div>

      {/* Achievements Chronological Feed (Newest First) */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-[var(--color-bg-secondary)] animate-pulse border border-[var(--color-border)]" />
          ))}
        </div>
      ) : achievements.length === 0 ? (
        <div className="glass-card p-12 text-center text-xs text-[var(--color-text-muted)] italic">
          {search ? `No achievements found matching "${search}".` : 'No department achievements posted yet.'}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {achievements.map((item) => (
            <div key={item._id} className="glass-card p-6 border border-[var(--color-border)] flex flex-col gap-4 transition-all hover:border-[var(--color-accent)]/40">
              {/* Header: Title + Formatted Date */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)]/60 pb-3">
                <h3 className="text-base font-black text-[var(--color-text-primary)]">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0 text-[11px] text-[var(--color-text-muted)]">
                  <span>📅</span>
                  <span className="font-semibold">
                    {new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  {item.postedBy?.name && (
                    <span className="ml-2 font-mono text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] font-bold">
                      Posted by {item.postedBy.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              )}

              {/* Media Content Blocks rendered via REUSED ContentBlockRenderer */}
              {item.media && item.media.length > 0 && (
                <div className="mt-2">
                  <ContentBlockRenderer blocks={item.media} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => { setPage(p => p - 1); fetchAchievements(search, page - 1); }}
            className="px-4 py-1.5 rounded-xl border border-[var(--color-border)] text-xs font-bold disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="text-xs font-semibold text-[var(--color-text-muted)]">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => { setPage(p => p + 1); fetchAchievements(search, page + 1); }}
            className="px-4 py-1.5 rounded-xl border border-[var(--color-border)] text-xs font-bold disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
