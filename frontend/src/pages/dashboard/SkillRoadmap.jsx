import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import skillRoadmapService from '../../services/skillRoadmap.service';
import ContentBlockRenderer from '../../components/shared/ContentBlockRenderer';
import RoadmapChecklistItem from '../../components/roadmap/RoadmapChecklistItem';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function SkillRoadmap() {
  const { user, setUser } = useAuth();
  const [items, setItems]                 = useState([]);
  const [activeSem, setActiveSem]         = useState(1);
  const [loading, setLoading]             = useState(true);
  const [collapsedMap, setCollapsedMap]   = useState({});
  const [allExpanded, setAllExpanded]     = useState(true);
  const [completionPercent, setCompletionPercent] = useState(
    user?.progress?.completionPercent ?? 0
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await skillRoadmapService.getRoadmap();
      setItems(data);
    } catch (err) {
      console.error('[SkillRoadmap] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const userChecklist = useMemo(() => user?.progress?.roadmapChecklist || [], [user]);

  const semesterItems = useMemo(
    () => items.filter((i) => i.semester === activeSem).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [items, activeSem]
  );

  const mandatoryItems = useMemo(
    () => semesterItems.filter((i) => i.mandatory),
    [semesterItems]
  );

  // Statistics for active semester
  const semCompletedCount = useMemo(
    () => semesterItems.filter((item) => userChecklist.some((c) => c.itemId === item._id && c.done)).length,
    [semesterItems, userChecklist]
  );

  const handleChecklistUpdate = (newPercent) => {
    setCompletionPercent(newPercent);
    if (setUser) {
      setUser((prev) => ({
        ...prev,
        progress: { ...prev?.progress, completionPercent: newPercent },
      }));
    }
  };

  const toggleItemCollapse = (id) => {
    setCollapsedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleExpandAll = () => {
    const nextState = !allExpanded;
    setAllExpanded(nextState);
    const newMap = {};
    semesterItems.forEach((item) => {
      newMap[item._id] = !nextState; // if expanding all, collapsedMap is false
    });
    setCollapsedMap(newMap);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* ── Top Header & Statistics Panel ───────────────────────────────────────── */}
      <div className="glass-card p-6 border border-[var(--color-border)] relative overflow-hidden bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-bg-secondary)]/40 to-[var(--color-surface)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Title & Info */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--color-accent)] to-indigo-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-[var(--color-accent)]/20 flex-shrink-0">
              🗺️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-[var(--color-text-primary)]">Semester-wise Skill Roadmap</h1>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20">
                  CSM Department
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Track semester modules, mandatory skills, documentation, practice links, and video resources.
              </p>
            </div>
          </div>

          {/* Progress Ring & Quick Stats */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8 border-t lg:border-t-0 lg:border-l border-[var(--color-border)] pt-4 lg:pt-0 lg:pl-8">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-[var(--color-accent)] tracking-tight">{completionPercent}%</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-text-muted)] mt-0.5">Overall Progress</span>
            </div>

            <div className="h-10 w-px bg-[var(--color-border)] hidden sm:block" />

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-primary)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{semCompletedCount} / {semesterItems.length} Completed</span>
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Semester {activeSem} Modules</span>
            </div>
          </div>

        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-1.5 bg-[var(--color-border)]/60 rounded-full mt-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--color-accent)] via-indigo-500 to-emerald-400 transition-all duration-700 ease-out"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* ── Semester Selector Tabs ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-wrap gap-2">
          {SEMESTERS.map((sem) => {
            const semAll = items.filter((i) => i.semester === sem);
            const semDone = semAll.filter((i) => userChecklist.some((c) => c.itemId === i._id && c.done)).length;
            const isFullyCompleted = semAll.length > 0 && semDone === semAll.length;

            return (
              <button
                key={sem}
                onClick={() => setActiveSem(sem)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 border ${
                  activeSem === sem
                    ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-md shadow-[var(--color-accent)]/20 scale-[1.02]'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]/50 hover:text-[var(--color-text-primary)]'
                }`}
              >
                <span>Sem {sem}</span>
                {semAll.length > 0 && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-black ${
                    activeSem === sem
                      ? 'bg-white/20 text-white'
                      : isFullyCompleted
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]'
                  }`}>
                    {isFullyCompleted ? '✓ Done' : semAll.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Expand / Collapse All Controls */}
        {semesterItems.length > 0 && (
          <button
            onClick={handleToggleExpandAll}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent)] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>{allExpanded ? '📂 Collapse All' : '📖 Expand All'}</span>
          </button>
        )}
      </div>

      {/* ── Mandatory Skills Showcase Banner ───────────────────────────────────────── */}
      {mandatoryItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-rose-500/5 to-transparent border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 font-black text-sm flex items-center justify-center animate-pulse">
              ⚡
            </span>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-red-400">
                Mandatory Skills for Semester {activeSem}
              </h3>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                These core modules are essential requirements for academic and placement readiness.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {mandatoryItems.map((m) => {
              const isDone = userChecklist.some((c) => c.itemId === m._id && c.done);
              return (
                <span
                  key={m._id}
                  className={`text-[11px] px-3 py-1 rounded-full font-bold border flex items-center gap-1.5 ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/15 border-red-500/30 text-red-300'
                  }`}
                >
                  <span className="text-[10px]">{isDone ? '✓' : '•'}</span>
                  <span>{m.skillGroupName}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Semester Modules List ───────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-[var(--color-bg-secondary)] animate-pulse" />
          ))}
        </div>
      ) : semesterItems.length === 0 ? (
        <div className="glass-card p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-3xl flex items-center justify-center mb-3">
            🗺️
          </div>
          <h3 className="text-base font-bold text-[var(--color-text-primary)]">No roadmap modules for Semester {activeSem}</h3>
          <p className="text-xs text-[var(--color-text-muted)] max-w-md mt-1">
            Your department administrator will publish learning groups, practice problems, reference docs, and video resources for this semester soon.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {semesterItems.map((item) => {
            const isCollapsed = collapsedMap[item._id] ?? !allExpanded;
            const isDone = userChecklist.some((c) => c.itemId === item._id && c.done);

            // Group content blocks by category for summary pill rendering
            const textCount  = item.contentBlocks?.filter(b => b.type === 'text').length || 0;
            const linkCount  = item.contentBlocks?.filter(b => b.type === 'link').length || 0;
            const videoCount = item.contentBlocks?.filter(b => b.type === 'video').length || 0;
            const fileCount  = item.contentBlocks?.filter(b => b.type === 'file' || b.type === 'pdf').length || 0;
            const imageCount = item.contentBlocks?.filter(b => b.type === 'image').length || 0;

            return (
              <div
                key={item._id}
                className={`glass-card overflow-hidden border transition-all duration-200 ${
                  isDone
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : item.mandatory
                    ? 'border-red-500/40 hover:border-red-500/70 shadow-sm'
                    : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50 shadow-sm'
                }`}
              >
                {/* Module Header Bar */}
                <div
                  onClick={() => toggleItemCollapse(item._id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none bg-[var(--color-surface)] hover:bg-[var(--color-bg-secondary)]/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <RoadmapChecklistItem
                      item={item}
                      userChecklist={userChecklist}
                      onUpdate={handleChecklistUpdate}
                    />
                  </div>

                  {/* Resource Badges & Expand Indicator */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap self-end sm:self-auto">
                    {/* Content Block Counter Chips */}
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--color-text-muted)]">
                      {textCount > 0 && <span className="px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">📝 {textCount}</span>}
                      {linkCount > 0 && <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">🔗 {linkCount}</span>}
                      {videoCount > 0 && <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">▶ {videoCount}</span>}
                      {fileCount > 0 && <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">📄 {fileCount}</span>}
                      {imageCount > 0 && <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-500 border border-teal-500/20">🖼 {imageCount}</span>}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleItemCollapse(item._id); }}
                      className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] font-bold px-2.5 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] ml-2"
                    >
                      {isCollapsed ? 'Show ▼' : 'Hide ▲'}
                    </button>
                  </div>
                </div>

                {/* Module Body (Expanded Details & Admin Content Blocks) */}
                {!isCollapsed && (
                  <div className="p-5 border-t border-[var(--color-border)]/60 bg-[var(--color-surface)] flex flex-col gap-4">
                    {item.description && (
                      <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed bg-[var(--color-bg-secondary)]/40 p-3 rounded-xl border border-[var(--color-border)]">
                        <span className="font-bold text-[var(--color-text-primary)]">Module Overview:</span> {item.description}
                      </div>
                    )}
                    
                    <div className="mt-1">
                      <ContentBlockRenderer blocks={item.contentBlocks || []} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
