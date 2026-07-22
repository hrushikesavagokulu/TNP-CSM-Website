import { useState, useEffect, useCallback } from 'react';
import adminDsaService from '../../services/admin/dsa.admin.service';

const RAW_TOPICS = [
  'Array Manipulation', 'Math', 'Linear Search', 'Prefix Sum', 'Prefix Product',
  'Matrix', 'String Manipulation', 'String Matching', 'Hashing',
  'Two Pointers', 'Sliding Window', 'Boyer-Moore Voting',
  'Binary Search', 'Sorting', 'Merge Sort', 'Quickselect',
  'Bit Manipulation', 'Stack', 'Linked List', 'Heap',
  'Binary Tree', 'Binary Search Tree', 'AVL Tree', 'Trie', 'Segment Tree', 'Fenwick Tree',
  'Graph', 'BFS', 'DFS', 'Topological Sort', 'Union Find', 'Disjoint Set',
  'Shortest Path', 'Dijkstra', 'Minimum Spanning Tree', 'Graph Coloring',
  'Divide and Conquer', 'Greedy', 'Backtracking', 'Dynamic Programming', "Kadane's Algorithm",
];

const SOURCES = ['leetcode', 'gfg', 'codeforces', 'cses', 'hackerrank', 'other'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const TRACKS = ['dsa', 'programming'];

export default function ManageProgrammingDsa() {
  const [topics, setTopics]             = useState([]);
  const [trackTotals, setTrackTotals]   = useState({ dsa: 0, programming: 0, total: 0 });
  const [problems, setProblems]         = useState([]);
  const [pagination, setPagination]     = useState({ page: 1, limit: 50, total: 0, pages: 1 });
  const [page, setPage]                 = useState(1);

  const [selectedTrack, setSelectedTrack] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedDiff, setSelectedDiff]   = useState('all');
  const [search, setSearch]               = useState('');

  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [success, setSuccess]           = useState(null);

  // Modals & Panels
  const [showAddSingle, setShowAddSingle] = useState(false);
  const [showBulk, setShowBulk]           = useState(false);

  const [form, setForm]                 = useState({
    title: '',
    link: '',
    source: 'leetcode',
    track: 'dsa',
    difficulty: 'easy',
    topic: 'Array Manipulation',
    patterns: '',
    companies: '',
    sheetRefs: 'striver-a2z',
    order: 0,
  });

  const [bulkJson, setBulkJson]         = useState('');
  const [bulkResult, setBulkResult]     = useState(null);

  // 1. Load Topics
  const loadTopics = useCallback(async () => {
    try {
      const data = await adminDsaService.getTopics({ track: selectedTrack !== 'all' ? selectedTrack : undefined });
      setTopics(data?.topics || []);
      if (data?.trackTotals) setTrackTotals(data.trackTotals);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load topics.');
    }
  }, [selectedTrack]);

  // 2. Load Problems
  const loadProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminDsaService.getProblems({
        track: selectedTrack !== 'all' ? selectedTrack : undefined,
        topic: selectedTopic !== 'all' ? selectedTopic : undefined,
        difficulty: selectedDiff !== 'all' ? selectedDiff : undefined,
        search: search.trim() || undefined,
        page,
        limit: 50,
      });
      setProblems(data?.problems || []);
      setPagination(data?.pagination || { page: 1, limit: 50, total: 0, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load problems.');
    } finally {
      setLoading(false);
    }
  }, [selectedTrack, selectedTopic, selectedDiff, search, page]);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProblems();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadProblems]);

  // Single Add Problem
  const handleAddSingle = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.title.trim() || !form.link.trim() || !form.topic.trim()) {
      setError('Title, link, and topic are required.');
      return;
    }

    try {
      const payload = {
        ...form,
        patterns: form.patterns.split(',').map(s => s.trim()).filter(Boolean),
        companies: form.companies.split(',').map(s => s.trim()).filter(Boolean),
        sheetRefs: form.sheetRefs.split(',').map(s => s.trim()).filter(Boolean),
      };
      await adminDsaService.addProblem(payload);
      setSuccess('Problem added successfully.');
      setForm({
        title: '',
        link: '',
        source: 'leetcode',
        track: 'dsa',
        difficulty: 'easy',
        topic: 'Array Manipulation',
        patterns: '',
        companies: '',
        sheetRefs: 'striver-a2z',
        order: 0,
      });
      setShowAddSingle(false);
      loadProblems();
      loadTopics();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add problem.');
    }
  };

  // Bulk Add Problems JSON
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBulkResult(null);

    let parsed = [];
    try {
      parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) {
        throw new Error('Input must be a JSON array of problem objects.');
      }
    } catch (err) {
      setError('Invalid JSON syntax: ' + err.message);
      return;
    }

    try {
      const result = await adminDsaService.bulkAddProblems(parsed);
      setBulkResult(result);
      setSuccess(`Processed ${parsed.length} problems successfully.`);
      setBulkJson('');
      loadProblems();
      loadTopics();
    } catch (err) {
      setError(err.response?.data?.message || 'Bulk import failed.');
    }
  };

  // Delete Problem
  const handleDeleteProblem = async (id, title) => {
    if (!window.confirm(`Delete problem "${title}"?`)) return;
    try {
      await adminDsaService.deleteProblem(id);
      loadProblems();
      loadTopics();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete problem.');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-danger)] animate-pulse" />
            <span className="font-mono text-xs font-bold text-[var(--color-danger)] uppercase tracking-widest">Admin Control</span>
          </div>
          <h1 className="font-display text-2xl font-extrabold text-[var(--color-text-primary)]">Manage Programming & DSA</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            DSA Track: {trackTotals.dsa || 0} problems · Programming Track: {trackTotals.programming || 0} problems
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddSingle(!showAddSingle)}
            className="btn-primary text-xs"
          >
            + Add Single Problem
          </button>
          <button
            onClick={() => setShowBulk(!showBulk)}
            className="px-3.5 py-2 text-xs font-mono font-bold rounded-lg border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] transition-all"
          >
            ⚡ Bulk JSON Import (~1200 Problems)
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 border border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] text-xs text-[var(--color-danger)]">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="glass-card p-4 border border-[var(--color-success)]/30 bg-[var(--color-success-bg)] text-xs text-[var(--color-success)]">
          ✓ {success}
        </div>
      )}

      {/* Bulk JSON Import Panel */}
      {showBulk && (
        <div className="glass-card p-6 flex flex-col gap-4 border-l-4 border-[var(--color-danger)]">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
              Bulk Import JSON Problems Array (Deduplicated on Import)
            </h3>
            <button onClick={() => setShowBulk(false)} className="text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">Close ✕</button>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Paste an array of problem objects containing <code className="font-mono text-[var(--color-accent)]">title</code>, <code className="font-mono text-[var(--color-accent)]">link</code>, <code className="font-mono text-[var(--color-accent)]">source</code>, <code className="font-mono text-[var(--color-accent)]">track</code>, <code className="font-mono text-[var(--color-accent)]">difficulty</code>, <code className="font-mono text-[var(--color-accent)]">topic</code>, <code className="font-mono text-[var(--color-accent)]">patterns</code>, <code className="font-mono text-[var(--color-accent)]">companies</code>, and <code className="font-mono text-[var(--color-accent)]">sheetRefs</code>:
          </p>

          <form onSubmit={handleBulkSubmit} className="flex flex-col gap-3">
            <textarea
              rows={8}
              placeholder={`[\n  {\n    "title": "Two Sum",\n    "link": "https://leetcode.com/problems/two-sum/",\n    "source": "leetcode",\n    "track": "dsa",\n    "difficulty": "easy",\n    "topic": "Hashing",\n    "patterns": ["Hashing"],\n    "companies": ["Google", "Amazon"],\n    "sheetRefs": ["neetcode-150", "blind-75"]\n  }\n]`}
              value={bulkJson}
              onChange={(e) => setBulkJson(e.target.value)}
              className="w-full p-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] font-mono text-xs rounded-xl focus:outline-none focus:border-[var(--color-accent)]"
            />
            <button type="submit" className="btn-primary text-xs w-fit">
              Import Problems Array
            </button>
          </form>

          {bulkResult && (
            <div className="p-3 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] font-mono text-xs text-[var(--color-success)]">
              ✓ Processed {bulkResult.totalProcessed} items (Upserted: {bulkResult.inserted}, Modified: {bulkResult.modified})
            </div>
          )}
        </div>
      )}

      {/* Add Single Problem Panel */}
      {showAddSingle && (
        <div className="glass-card p-6 flex flex-col gap-4 border-l-4 border-[var(--color-accent)]">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
              Add New Practice Problem
            </h3>
            <button onClick={() => setShowAddSingle(false)} className="text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">Close ✕</button>
          </div>

          <form onSubmit={handleAddSingle} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-mono text-[var(--color-text-muted)] font-bold block mb-1 uppercase">Problem Title</label>
              <input
                type="text"
                placeholder="e.g. Two Sum"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-mono text-[var(--color-text-muted)] font-bold block mb-1 uppercase">Problem URL Link</label>
              <input
                type="url"
                placeholder="https://leetcode.com/problems/two-sum/"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs font-mono focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-[var(--color-text-muted)] font-bold block mb-1 uppercase">Track</label>
              <select
                value={form.track}
                onChange={(e) => setForm({ ...form, track: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs font-mono focus:outline-none"
              >
                {TRACKS.map((t) => (
                  <option key={t} value={t}>{t.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[var(--color-text-muted)] font-bold block mb-1 uppercase">Topic</label>
              <select
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none"
              >
                {RAW_TOPICS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[var(--color-text-muted)] font-bold block mb-1 uppercase">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs font-mono focus:outline-none"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[var(--color-text-muted)] font-bold block mb-1 uppercase">Source Platform</label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs font-mono focus:outline-none"
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>{s.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[var(--color-text-muted)] font-bold block mb-1 uppercase">Patterns (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. Hashing, Two Pointers"
                value={form.patterns}
                onChange={(e) => setForm({ ...form, patterns: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs font-mono focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-[var(--color-text-muted)] font-bold block mb-1 uppercase">Companies (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. Google, Amazon"
                value={form.companies}
                onChange={(e) => setForm({ ...form, companies: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs font-mono focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary text-xs">
                Save Problem
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full relative">
          <input
            type="text"
            placeholder="Search problems by title, topic, or company..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs font-mono focus:outline-none focus:border-[var(--color-accent)]"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-xs">
            🔍
          </div>
        </div>

        <select
          value={selectedTrack}
          onChange={(e) => { setSelectedTrack(e.target.value); setPage(1); }}
          className="w-full sm:w-36 px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs font-mono focus:outline-none"
        >
          <option value="all">All Tracks</option>
          <option value="dsa">DSA ({trackTotals.dsa})</option>
          <option value="programming">Programming ({trackTotals.programming})</option>
        </select>

        <select
          value={selectedTopic}
          onChange={(e) => { setSelectedTopic(e.target.value); setPage(1); }}
          className="w-full sm:w-48 px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs font-mono focus:outline-none"
        >
          <option value="all">All Topics ({topics.length})</option>
          {topics.map((t) => (
            <option key={t.name} value={t.name}>{t.name} ({t.problemCount})</option>
          ))}
        </select>
      </div>

      {/* Problems Roster Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-xs text-[var(--color-text-secondary)]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] font-mono text-[10px] uppercase tracking-wide sticky top-0 z-10">
                <th className="p-4 w-12">#</th>
                <th className="p-4">Title</th>
                <th className="p-4 w-28 text-center">Track</th>
                <th className="p-4 w-36">Topic</th>
                <th className="p-4 w-28 text-center">Difficulty</th>
                <th className="p-4 w-28 text-center">Source</th>
                <th className="p-4 w-28 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]/60 bg-[var(--color-surface)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center font-mono text-xs text-[var(--color-text-muted)] italic">
                    Loading problems...
                  </td>
                </tr>
              ) : problems.length > 0 ? (
                problems.map((p, idx) => (
                  <tr key={p._id} className="hover:bg-[var(--color-surface-raised)] transition-colors">
                    <td className="p-4 font-mono font-bold text-[var(--color-text-muted)]">
                      {(page - 1) * pagination.limit + idx + 1}
                    </td>
                    <td className="p-4">
                      <a href={p.link} target="_blank" rel="noreferrer" className="font-bold text-[var(--color-text-primary)] hover:text-[var(--color-accent)] no-underline">
                        {p.title} ↗
                      </a>
                    </td>
                    <td className="p-4 text-center font-mono font-bold uppercase text-[10px]">
                      <span className={`px-2 py-0.5 rounded ${p.track === 'programming' ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]' : 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'}`}>
                        {p.track || 'dsa'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                        {p.topic}
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono font-bold uppercase text-[10px]">
                      {p.difficulty}
                    </td>
                    <td className="p-4 text-center font-mono font-bold uppercase text-[10px]">
                      {p.source}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDeleteProblem(p._id, p.title)}
                        className="px-2.5 py-1 border border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] text-[var(--color-danger)] hover:bg-[var(--color-danger)]/20 rounded font-mono font-bold text-[10px]"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center font-mono text-xs text-[var(--color-text-muted)] italic">
                    No problems listed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
