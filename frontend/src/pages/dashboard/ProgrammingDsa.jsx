import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import dsaService from '../../services/dsa.service';
import { useAuth } from '../../context/AuthContext';

const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'];
const SOURCES = ['all', 'leetcode', 'gfg', 'codeforces', 'cses', 'hackerrank', 'other'];

const PROGRAMMING_FLAT_TOPICS = [
  'Array Manipulation', 'String Manipulation', 'Math', 'Linear Search',
  'Sorting', 'Bit Manipulation', 'Hashing', 'Stack'
];

const POPULAR_COMPANIES = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Flipkart', 'Adobe', 'Uber'];
const POPULAR_PATTERNS = ['Sliding Window', 'Two Pointers', 'Monotonic Stack', 'Binary Search on Answer', 'Union-Find/DSU', 'DP (1D)'];

export default function ProgrammingDsa() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Track state driven by URL query param
  const activeTrack   = searchParams.get('track') === 'programming' ? 'programming' : 'dsa';
  const activeTopic   = searchParams.get('topic') || 'all';
  const activeDiff    = searchParams.get('difficulty') || 'all';
  const activeSource  = searchParams.get('source') || 'all';
  const activeStatus  = searchParams.get('status') || 'all'; // 'all', 'solved', 'starred', 'revision'
  const activeCompany = searchParams.get('company') || 'all';
  const activePattern = searchParams.get('pattern') || 'all';

  const [topics, setTopics]           = useState([]);
  const [trackTotals, setTrackTotals] = useState({ dsa: 0, programming: 0, total: 0 });
  const [search, setSearch]           = useState('');

  const [problems, setProblems]       = useState([]);
  const [pagination, setPagination]   = useState({ page: 1, limit: 50, total: 0, pages: 1 });
  const [page, setPage]               = useState(1);

  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  // User Local Progress Storage (Solved, Starred, Revision)
  const userId = user?.rollNo || user?._id || 'guest';
  const storageKey = `tnp_dsa_progress_${userId}`;

  const [progressData, setProgressData] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : { solved: [], starred: [], revision: [] };
    } catch {
      return { solved: [], starred: [], revision: [] };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(progressData));
    } catch (e) {
      console.error('Failed to save DSA progress:', e);
    }
  }, [progressData, storageKey]);

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
        search: (search || activeCompany !== 'all' ? activeCompany : activePattern !== 'all' ? activePattern : '').trim() || undefined,
        page,
        limit: 50,
      });
      
      let fetched = data?.problems || [];

      // Filter by progress status if selected
      if (activeStatus === 'solved') {
        fetched = fetched.filter(p => progressData.solved.includes(p._id) || progressData.solved.includes(p.slugId));
      } else if (activeStatus === 'starred') {
        fetched = fetched.filter(p => progressData.starred.includes(p._id) || progressData.starred.includes(p.slugId));
      } else if (activeStatus === 'revision') {
        fetched = fetched.filter(p => progressData.revision.includes(p._id) || progressData.revision.includes(p.slugId));
      }

      setProblems(fetched);
      setPagination(data?.pagination || { page: 1, limit: 50, total: 0, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load practice problems.');
    } finally {
      setLoading(false);
    }
  }, [activeTrack, activeTopic, activeDiff, activeSource, activeStatus, activeCompany, activePattern, search, page, progressData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProblems();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadProblems]);

  // Status Toggles
  const toggleStatus = (id, key) => {
    setProgressData((prev) => {
      const list = prev[key] || [];
      const exists = list.includes(id);
      const updated = exists ? list.filter((x) => x !== id) : [...list, id];
      return { ...prev, [key]: updated };
    });
  };

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

  // Stat metrics
  const solvedCount   = progressData.solved.length;
  const starredCount  = progressData.starred.length;
  const revisionCount = progressData.revision.length;
  const totalCount    = trackTotals.total || problems.length || 1;
  const solvedPct     = Math.min(100, Math.round((solvedCount / totalCount) * 100));

  return (
    <div className="flex flex-col gap-8 animate-fade-in font-sans pb-16">
      
      {/* Page Header */}
      <div className="border-b border-[var(--color-border)] pb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
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
            Master 700+ curated problems from Striver A2Z, NeetCode 150, Blind 75, GFG & HackerRank.
          </p>
        </div>

        {/* Primary Track Segmented Control */}
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

      {/* User Progress Widget */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 flex items-center gap-4 border-l-4 border-[var(--color-accent)]">
          <div className="w-12 h-12 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] flex items-center justify-center font-mono font-bold text-sm text-[var(--color-accent)]">
            {solvedPct}%
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Solved Progress</div>
            <div className="text-lg font-display font-extrabold text-[var(--color-text-primary)]">{solvedCount} <span className="text-xs text-[var(--color-text-muted)] font-normal">/ {totalCount}</span></div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4 border-l-4 border-emerald-500">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg">
            ✅
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Status Solved</div>
            <div className="text-lg font-display font-extrabold text-[var(--color-text-primary)]">{solvedCount} Problems</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4 border-l-4 border-amber-500">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg">
            ⭐
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Starred Favorites</div>
            <div className="text-lg font-display font-extrabold text-[var(--color-text-primary)]">{starredCount} Saved</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4 border-l-4 border-rose-500">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-lg">
            🔄
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Revision Flagged</div>
            <div className="text-lg font-display font-extrabold text-[var(--color-text-primary)]">{revisionCount} Flagged</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 border border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] text-xs text-[var(--color-danger)]">
          ⚠️ {error}
        </div>
      )}

      {/* Status Tabs: All, Solved, Starred, Revision */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] pb-2">
        <div className="flex items-center gap-1 font-mono text-xs">
          <button
            onClick={() => updateParams({ status: 'all' })}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all border ${
              activeStatus === 'all'
                ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)] border-[var(--color-accent)]'
                : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            All Problems
          </button>
          <button
            onClick={() => updateParams({ status: 'solved' })}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all border flex items-center gap-1.5 ${
              activeStatus === 'solved'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <span>Solved</span>
            <span className="text-[10px] px-1.5 rounded-full bg-black/20">{solvedCount}</span>
          </button>
          <button
            onClick={() => updateParams({ status: 'starred' })}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all border flex items-center gap-1.5 ${
              activeStatus === 'starred'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <span>Starred ⭐</span>
            <span className="text-[10px] px-1.5 rounded-full bg-black/20">{starredCount}</span>
          </button>
          <button
            onClick={() => updateParams({ status: 'revision' })}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all border flex items-center gap-1.5 ${
              activeStatus === 'revision'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <span>Revision 🔄</span>
            <span className="text-[10px] px-1.5 rounded-full bg-black/20">{revisionCount}</span>
          </button>
        </div>

        {/* Company & Pattern Cloud Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activeCompany}
            onChange={(e) => updateParams({ company: e.target.value })}
            className="px-2.5 py-1 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs font-mono"
          >
            <option value="all">Company: All</option>
            {POPULAR_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={activePattern}
            onChange={(e) => updateParams({ pattern: e.target.value })}
            className="px-2.5 py-1 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs font-mono"
          >
            <option value="all">Pattern: All</option>
            {POPULAR_PATTERNS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

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
                <th className="p-4 w-12 text-center">Status</th>
                <th className="p-4">Problem Title & Metadata</th>
                <th className="p-4 w-36">Topic & Pattern</th>
                <th className="p-4 w-28 text-center">Difficulty</th>
                <th className="p-4 w-28 text-center">Platform</th>
                <th className="p-4 w-36 text-center">Actions</th>
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
                problems.map((p, idx) => {
                  const isSolved   = progressData.solved.includes(p._id) || progressData.solved.includes(p.slugId);
                  const isStarred  = progressData.starred.includes(p._id) || progressData.starred.includes(p.slugId);
                  const isRevision = progressData.revision.includes(p._id) || progressData.revision.includes(p.slugId);

                  return (
                    <tr key={p._id} className="hover:bg-[var(--color-surface-raised)] transition-colors">
                      {/* Solved Checkbox */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleStatus(p._id, 'solved')}
                          title={isSolved ? 'Mark Unsolved' : 'Mark Solved'}
                          className={`w-6 h-6 rounded-full font-mono text-xs flex items-center justify-center transition-all border ${
                            isSolved
                              ? 'bg-emerald-500 text-white border-emerald-500'
                              : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]'
                          }`}
                        >
                          {isSolved ? '✓' : idx + 1}
                        </button>
                      </td>

                      {/* Title & Metadata */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <a
                              href={p.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors text-xs no-underline"
                            >
                              {p.title} ↗
                            </a>
                            {isStarred && <span className="text-amber-500 text-xs">⭐</span>}
                            {isRevision && <span className="text-rose-500 text-[10px] font-mono font-bold px-1 bg-rose-500/10 rounded">REV</span>}
                          </div>
                          
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

                      {/* Topic & Pattern */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border)] w-fit">
                            {p.topic}
                          </span>
                          {p.patterns?.length > 0 && p.patterns[0] !== p.topic && (
                            <span className="text-[9px] font-mono text-[var(--color-text-muted)]">
                              {p.patterns.join(', ')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Difficulty */}
                      <td className="p-4 text-center">
                        <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded border ${getDiffColor(p.difficulty)}`}>
                          {p.difficulty}
                        </span>
                      </td>

                      {/* Platform */}
                      <td className="p-4 text-center">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
                          {p.source}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Direct External Solve Button */}
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-[var(--color-accent)] text-[var(--color-text-inverse)] text-[10px] font-mono font-bold rounded-lg hover:bg-[var(--color-accent-hover)] transition-all no-underline"
                            title="Open Problem on Official Platform"
                          >
                            Solve ↗
                          </a>

                          {/* Star Toggle */}
                          <button
                            onClick={() => toggleStatus(p._id, 'starred')}
                            className={`p-1.5 rounded-lg border text-[10px] ${isStarred ? 'bg-amber-500/20 text-amber-500 border-amber-500/40' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-amber-500'}`}
                            title="Star Favorite"
                          >
                            ⭐
                          </button>

                          {/* Revision Toggle */}
                          <button
                            onClick={() => toggleStatus(p._id, 'revision')}
                            className={`p-1.5 rounded-lg border text-[10px] ${isRevision ? 'bg-rose-500/20 text-rose-500 border-rose-500/40' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-rose-500'}`}
                            title="Flag for Revision"
                          >
                            🔄
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
