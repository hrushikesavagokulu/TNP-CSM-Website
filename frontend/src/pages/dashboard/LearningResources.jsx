import { useState, useEffect, useCallback, useMemo } from 'react';
import learningResourceService from '../../services/learningResource.service';
import ContentBlockRenderer from '../../components/shared/ContentBlockRenderer';

export default function LearningResources() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await learningResourceService.getResources();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Group by skillName client-side
  const grouped = useMemo(() => {
    const filtered = search.trim()
      ? items.filter((i) => i.skillName.toLowerCase().includes(search.toLowerCase()))
      : items;

    return filtered.reduce((acc, item) => {
      if (!acc[item.skillName]) acc[item.skillName] = [];
      acc[item.skillName].push(item);
      return acc;
    }, {});
  }, [items, search]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Learning Resources</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Curated materials, tutorials and references by skill area</p>
        </div>
        <input
          type="text"
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] text-xs rounded-xl w-full sm:w-60 focus:outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1,2,3].map((i) => <div key={i} className="h-16 rounded-xl bg-[var(--color-bg-secondary)] animate-pulse" />)}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
            {search ? `No resources matching "${search}"` : 'No learning resources added yet'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(grouped).map(([skillName, skillItems]) => (
            <div key={skillName}>
              <h2 className="text-sm font-black uppercase tracking-wider text-[var(--color-accent)] mb-3">
                {skillName}
              </h2>
              <div className="flex flex-col gap-2">
                {skillItems.map((item) => (
                  <div key={item._id} className="glass-card border-l-4 border-l-[var(--color-accent)]/40 overflow-hidden">
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📚</span>
                        <div>
                          <p className="text-xs font-bold text-[var(--color-text-primary)]">{item.skillName}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">
                            {item.contentBlocks?.length ?? 0} resource{(item.contentBlocks?.length ?? 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
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
