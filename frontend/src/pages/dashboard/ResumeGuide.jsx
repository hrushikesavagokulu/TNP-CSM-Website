import { useState, useEffect, useCallback } from 'react';
import resumeGuideService from '../../services/resumeGuide.service';
import ContentBlockRenderer from '../../components/shared/ContentBlockRenderer';

export default function ResumeGuide() {
  const [sections, setSections]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await resumeGuideService.getGuide();
      setSections(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Resume Guide</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">Build a professional resume with department-curated guidance</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1,2,3].map((i) => <div key={i} className="h-16 rounded-xl bg-[var(--color-bg-secondary)] animate-pulse" />)}
        </div>
      ) : sections.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-4xl mb-3">📄</p>
          <p className="text-sm font-semibold text-[var(--color-text-secondary)]">No resume guide sections added yet</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Your department will add guidance sections soon.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sections.map((section, idx) => (
            <div
              key={section._id}
              className="glass-card border-l-4 border-l-[var(--color-accent)]/50 overflow-hidden"
            >
              <div
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === section._id ? null : section._id)}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[var(--color-text-primary)]">{section.title}</p>
                    {section.description && (
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{section.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {section.contentBlocks?.length > 0 && (
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      {section.contentBlocks.length} resource{section.contentBlocks.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  <span className="text-[var(--color-text-muted)]">{expandedId === section._id ? '▲' : '▼'}</span>
                </div>
              </div>
              {expandedId === section._id && (
                <div className="px-4 pb-4 border-t border-[var(--color-border)] pt-3">
                  <ContentBlockRenderer blocks={section.contentBlocks || []} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
