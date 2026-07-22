import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import dsaService from '../../services/dsa.service';

const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'];
const SOURCES = ['all', 'leetcode', 'gfg', 'codeforces', 'cses', 'hackerrank', 'other'];

const PROGRAMMING_FLAT_TOPICS = [
  'Array Manipulation', 'String Manipulation', 'Math', 'Linear Search',
  'Sorting', 'Bit Manipulation', 'Hashing', 'Stack'
];

export default function ProgrammingDsa() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Track state driven by URL query param
  const activeTrack = searchParams.get('track') === 'programming' ? 'programming' : 'dsa';
  const activeTopic = searchParams.get('topic') || 'all';
  const activeDiff  = searchParams.get('difficulty') || 'all';
  const activeSource = searchParams.get('source') || 'all';

  const [topics, setTopics]           = useState([]);
  const [trackTotals, setTrackTotals] = useState({ dsa: 0, programming: 0, total: 0 });
  const [search, setSearch]           = useState('');

  const [problems, setProblems]       = useState([]);
  const [pagination, setPagination]   = useState({ page: 1, limit: 50, total: 0, pages: 1 });
  const [page, setPage]               = useState(1);

  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  // Update query params helper
  const updateParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged  = { ...current, ...newParams };
    Object.keys(merged).forEach((k) => {
      if (merged[k] === 'all' || !merged[k]) delete merged[k];
    });
    setSearchParams(merged);
    setPage(1);
  };

  // 1. Fetch Topics & Track Totals
  useEffect(() => {
    let cancelled = false;
    dsaService.getTopics({ track: activeTrack })
      .then((data) => {
        if (!cancelled) {
          setTopics(data?.topics || []);
          if (data?.trackTotals) setTrackTotals(data.trackTotals);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load DSA topics.');
      });
    return () => { cancelled = true; };
  }, [activeTrack]);

  // 2. Fetch Problems
  const loadProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dsaService.getProblems({
        track: activeTrack,
        topic: activeTopic !== 'all' ? activeTopic : undefined,
        difficulty: activeDiff !== 'all' ? activeDiff : undefined,
        source: activeSource !== 'all' ? activeSource : undefined,
        search: search.trim() || undefined,
        page,
        limit: 50,
      });
      setProblems(data?.problems || []);
      setPagination(data?.pagination || { page: 1, limit: 50, total: 0, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load practice problems.');
    } finally {
      setLoading(false);
    }
  }, [activeTrack, activeTopic, activeDiff, activeSource, search, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProblems();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadProblems]);

  // Filter topics for programming track vs DSA track taxonomy
  const visibleTopics = activeTrack === 'programming'
    ? topics.filter(t => PROGRAMMING_FLAT_TOPICS.includes(t.name) || t.problemCount > 0)
    : topics;

  const activeTopicObj = topics.find((t) => t.name === activeTopic);

  const getDiffColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]/30';
      case 'medium':
        return 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning)]/30';
      case 'hard':
        return 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger)]/30';
      default:
        return 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] border-[var(--color-border)]';
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in font-sans pb-16">
      
      {/* Page Header */}
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-[var(--color-accent)] uppercase tracking-widest">
              Placement & Coding Preparation
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
            Programming & Data Structures (DSA)
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Curated problem sets from Striver A2Z, NeetCode 150, Blind 75, GFG & HackerRank.
          </p>
        </div>

        {/* Primary Track Segmented Control (Section 9 Spec) */}
        <div className="inline-flex p-1 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-xl">
          <button
            onClick={() => updateParams({ track: 'dsa', topic: 'all' })}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTrack === 'dsa'
                ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <span>💻 DSA Track</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTrack === 'dsa' ? 'bg-black/20 text-white' : 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'}`}>
              {trackTotals.dsa || 0}
            </span>
          </button>

          <button
            onClick={() => updateParams({ track: 'programming', topic: 'all' })}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTrack === 'programming'
                ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <span>⚡ Programming Track</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTrack === 'programming' ? 'bg-black/20 text-white' : 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'}`}>
              {trackTotals.programming || 0}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 border border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] text-xs text-[var(--color-danger)]">
          ⚠️ {error}
        </div>
      )}

      {/* Topics Carousel / Tag Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
            {activeTrack === 'programming' ? 'Flat Topic Focus' : 'DSA Taxonomy'} ({visibleTopics.length})
          </h2>
          {activeTopic !== 'all' && (
            <button
              onClick={() => updateParams({ topic: 'all' })}
              className="text-[10px] font-mono text-[var(--color-accent)] hover:underline"
            >
              Clear Topic Filter ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto p-1 scrollbar-thin">
          <button
            onClick={() => updateParams({ topic: 'all' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
              activeTopic === 'all'
                ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)] border-[var(--color-accent)]'
                : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-border)]'
            }`}
          >
            All Topics
          </button>
          {visibleTopics.map((t) => (
            <button
              key={t._id}
              onClick={() => updateParams({ topic: t.name })}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 border ${
                activeTopic === t.name
                  ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)] border-[var(--color-accent)]'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-border)]'
              }`}
            >
              <span>{t.name}</span>
              {t.problemCount > 0 && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                  activeTopic === t.name ? 'bg-black/20 text-current' : 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                }`}>
                  {t.problemCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Topic Learning Reference Links */}
      {activeTopicObj && activeTopicObj.referenceLinks?.length > 0 && (
        <div className="glass-card p-5 border-l-4 border-[var(--color-accent)] bg-[var(--color-accent-subtle)]/30 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">📚</span>
            <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)]">
              Reference Guides & Documentation for {activeTopicObj.name}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {activeTopicObj.referenceLinks.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-[var(--color-surface)] text-[var(--color-accent)] border border-[var(--color-accent-border)] hover:bg-[var(--color-accent)] hover:text-[var(--color-text-inverse)] transition-all no-underline"
              >
                <span>{url.includes('geeksforgeeks') ? 'GeeksForGeeks' : url.includes('leetcode') ? 'LeetCode Tag' : url.includes('visualgo') ? 'VisuAlgo' : 'Reference Link'}</span>
                <span>↗</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center gap-4">
        {/* Search */}
        <div className="flex-1 w-full relative">
          <input
            type="text"
            placeholder="Search problems by title, topic, pattern, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs font-mono focus:outline-none focus:border-[var(--color-accent)]"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-xs">
            🔍
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="w-full sm:w-36">
          <select
            value={activeDiff}
            onChange={(e) => updateParams({ difficulty: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs font-mono focus:outline-none"
          >
            <option value="all">All Difficulties</option>
            {DIFFICULTIES.filter(d => d !== 'all').map(d => (
              <option key={d} value={d}>{d.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Source Platform Filter */}
        <div className="w-full sm:w-40">
          <select
            value={activeSource}
            onChange={(e) => updateParams({ source: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs font-mono focus:outline-none"
          >
            <option value="all">All Platforms</option>
            {SOURCES.filter(s => s !== 'all').map(s => (
              <option key={s} value={s}>{s.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Problems Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-xs text-[var(--color-text-secondary)]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] font-mono text-[10px] uppercase tracking-wide sticky top-0 z-10">
                <th className="p-4 w-12">#</th>
                <th className="p-4">Problem Title & Metadata</th>
                <th className="p-4 w-36">Topic & Pattern</th>
                <th className="p-4 w-28 text-center">Difficulty</th>
                <th className="p-4 w-28 text-center">Platform</th>
                <th className="p-4 w-28 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]/60 bg-[var(--color-surface)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center font-mono text-xs text-[var(--color-text-muted)] italic">
                    Loading practice problems...
                  </td>
                </tr>
              ) : problems.length > 0 ? (
                problems.map((p, idx) => (
                  <tr key={p._id} className="hover:bg-[var(--color-surface-raised)] transition-colors">
                    <td className="p-4 font-mono font-bold text-[var(--color-text-muted)]">
                      {(page - 1) * pagination.limit + idx + 1}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors text-xs">
                          {p.title}
                        </span>
                        
                        {/* Company Tags & Sheet References */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          {p.sheetRefs?.map((sheet) => (
                            <span key={sheet} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-bold">
                              #{sheet}
                            </span>
                          ))}
                          {p.companies?.map((comp) => (
                            <span key={comp} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                              🏢 {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border)] w-fit">
                          {p.topic}
                        </span>
                        {p.patterns?.length > 0 && p.patterns[0] !== p.topic && (
                          <span className="text-[9px] font-mono text-[var(--color-text-muted)]">
                            Pattern: {p.patterns.join(', ')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded border ${getDiffColor(p.difficulty)}`}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
                        {p.source}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--color-accent)] text-[var(--color-text-inverse)] text-[10px] font-mono font-bold rounded-lg hover:bg-[var(--color-accent-hover)] transition-all no-underline"
                      >
                        <span>Solve</span>
                        <span>↗</span>
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center font-mono text-xs text-[var(--color-text-muted)] italic">
                    No problems found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
          <span className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
            Page {pagination.page} of {pagination.pages} ({pagination.total} problems)
          </span>
          <div className="flex gap-2 font-mono">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-[var(--color-border)] rounded-lg text-xs font-bold text-[var(--color-text-secondary)] disabled:opacity-50 hover:bg-[var(--color-surface-raised)]"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-3 py-1 border border-[var(--color-border)] rounded-lg text-xs font-bold text-[var(--color-text-secondary)] disabled:opacity-50 hover:bg-[var(--color-surface-raised)]"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
