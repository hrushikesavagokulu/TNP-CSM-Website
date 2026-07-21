import { useState, useEffect, useCallback } from 'react';
import certificationService from '../../services/certification.service';
import ContentBlockRenderer from '../../components/shared/ContentBlockRenderer';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function Certifications() {
  const [items, setItems]         = useState([]);
  const [activeSem, setActiveSem] = useState(null); // null = all
  const [loading, setLoading]     = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await certificationService.getCertifications(activeSem);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeSem]);

  useEffect(() => { load(); }, [load]);

  // Group by semester for display when "All" is selected
  const grouped = SEMESTERS.reduce((acc, sem) => {
    const semItems = items.filter((i) => i.semester === sem);
    if (semItems.length) acc[sem] = semItems;
    return acc;
  }, {});

  const displayItems = activeSem ? items : null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Semester Certifications</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">Recommended certifications to earn each semester</p>
      </div>

      {/* Semester filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSem(null)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            activeSem === null
              ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
          }`}
        >
          All Semesters
        </button>
        {SEMESTERS.map((sem) => (
          <button
            key={sem}
            onClick={() => setActiveSem(sem)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              activeSem === sem
                ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
            }`}
          >
            Sem {sem}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1,2,3].map((i) => <div key={i} className="h-16 rounded-xl bg-[var(--color-bg-secondary)] animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-4xl mb-3">🏅</p>
          <p className="text-sm font-semibold text-[var(--color-text-secondary)]">No certifications posted yet</p>
        </div>
      ) : activeSem ? (
        // Single semester view
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item._id} className="glass-card border-l-4 border-l-[var(--color-accent)]/50 overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
              >
                <div>
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">{item.name}</p>
                  {item.description && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.description}</p>}
                </div>
                <span className="text-[var(--color-text-muted)]">{expandedId === item._id ? '▲' : '▼'}</span>
              </div>
              {expandedId === item._id && (
                <div className="px-4 pb-4 border-t border-[var(--color-border)] pt-3">
                  <ContentBlockRenderer blocks={item.contentBlocks || []} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // All semesters — grouped
        <div className="flex flex-col gap-6">
          {Object.entries(grouped).map(([sem, semItems]) => (
            <div key={sem}>
              <h2 className="text-sm font-black uppercase tracking-wider text-[var(--color-accent)] mb-3">
                Semester {sem}
              </h2>
              <div className="flex flex-col gap-2">
                {semItems.map((item) => (
                  <div key={item._id} className="glass-card border-l-4 border-l-[var(--color-accent)]/50 overflow-hidden">
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
                    >
                      <div>
                        <p className="text-sm font-bold text-[var(--color-text-primary)]">{item.name}</p>
                        {item.description && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.description}</p>}
                      </div>
                      <span className="text-[var(--color-text-muted)]">{expandedId === item._id ? '▲' : '▼'}</span>
                    </div>
                    {expandedId === item._id && (
                      <div className="px-4 pb-4 border-t border-[var(--color-border)] pt-3">
                        <ContentBlockRenderer blocks={item.contentBlocks || []} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
