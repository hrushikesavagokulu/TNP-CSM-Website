import { useState, useEffect } from 'react';
import resumeTemplatesService         from '../../services/resumeTemplates.service';
import resumeGuideSectionsService     from '../../services/resumeGuideSections.service';
import resumeReferencesService        from '../../services/resumeReferences.service';
import atsCheckerLinksService         from '../../services/atsCheckerLinks.service';
import resumeImprovementResourcesService from '../../services/resumeImprovementResources.service';
import ContentBlockRenderer           from '../../components/shared/ContentBlockRenderer';
import AtsLinkCard                    from '../../components/resumeGuide/AtsLinkCard';
import ClickableImage                 from '../../components/shared/ClickableImage';

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'templates',    label: '📄 Templates',      icon: '📄' },
  { id: 'guide',        label: '🏗️ Building Guide', icon: '🏗️' },
  { id: 'references',   label: '📚 References',     icon: '📚' },
  { id: 'ats',          label: '🔍 ATS Checkers',   icon: '🔍' },
  { id: 'improvement',  label: '💡 Improve Resume',  icon: '💡' },
];

const CATEGORIES = ['all', 'fresher', 'experienced', 'internship', 'general'];

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function Skeleton({ lines = 3 }) {
  return (
    <div className="animate-pulse flex flex-col gap-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 rounded bg-[var(--color-border)] w-full" style={{ width: `${70 + Math.random() * 30}%` }} />
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function Empty({ icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="text-4xl select-none">{icon}</div>
      <p className="text-xs font-mono text-[var(--color-text-muted)]">{message}</p>
    </div>
  );
}

// ─── Template card ────────────────────────────────────────────────────────────
function TemplateCard({ item }) {
  return (
    <div className="glass-card flex flex-col overflow-hidden group hover:border-[var(--color-accent)] transition-all">
      {/* Thumbnail Container with Overflow-Hidden & Zoom */}
      <div className="aspect-[3/4] bg-[var(--color-bg-secondary)] flex items-center justify-center overflow-hidden relative">
        {item.previewImageUrl ? (
          <ClickableImage src={item.previewImageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[var(--color-text-muted)]">
            <span className="text-3xl">📄</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">No Preview</span>
          </div>
        )}

        {/* Compact Corner Download Icon-Button */}
        <a
          href={item.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          aria-label={`Download ${item.title}`}
          className="absolute top-2 right-2 p-2 rounded-lg bg-black/60 hover:bg-[var(--color-accent)] text-white backdrop-blur-md border border-white/20 transition-all opacity-90 group-hover:opacity-100"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </a>
      </div>

      {/* Info Body */}
      <div className="p-3.5 flex flex-col gap-1.5 flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-xs font-bold text-[var(--color-text-primary)] truncate">{item.title}</h3>
            <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent-border)] flex-shrink-0">
              {item.category}
            </span>
          </div>
          {item.description && <p className="text-[10px] text-[var(--color-text-secondary)] line-clamp-2 mt-1">{item.description}</p>}
        </div>

        <a
          href={item.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="mt-2 w-full py-1.5 bg-[var(--color-accent-subtle)] hover:bg-[var(--color-accent)] text-[var(--color-accent)] hover:text-[var(--color-text-inverse)] text-[10px] font-mono font-bold rounded-lg text-center border border-[var(--color-accent-border)] transition-all"
        >
          Download {item.fileType?.toUpperCase() || 'Template'}
        </a>
      </div>
    </div>
  );
}

// ─── Guide section card ───────────────────────────────────────────────────────
function GuideSectionCard({ item, index }) {
  const formattedIndex = String(index + 1).padStart(2, '0');
  return (
    <div className="relative pl-8 sm:pl-10">
      {/* Step Badge */}
      <div className="absolute left-0 top-6 w-7 h-7 rounded-lg bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] text-[var(--color-accent)] font-mono font-bold text-xs flex items-center justify-center z-10">
        {formattedIndex}
      </div>

      {/* Section Card */}
      <div className="glass-card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
          <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)]">{item.sectionTitle}</h3>
          <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
            item.isRequired
              ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border-[var(--color-accent-border)]'
              : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] border-[var(--color-border)]'
          }`}>
            {item.isRequired ? 'Required' : 'Optional'}
          </span>
        </div>

        {item.contentBlocks?.length > 0 ? (
          <ContentBlockRenderer blocks={item.contentBlocks} />
        ) : (
          <p className="text-xs text-[var(--color-text-muted)] italic">No content yet for this section.</p>
        )}
      </div>
    </div>
  );
}

// ─── Reference card ───────────────────────────────────────────────────────────
function ReferenceCard({ item }) {
  return (
    <div className="glass-card p-5 flex flex-col gap-3">
      <div>
        <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)]">{item.title}</h3>
        {item.category && (
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[var(--color-accent)] bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] px-2 py-0.5 rounded inline-block mt-1">
            {item.category}
          </span>
        )}
        {item.description && <p className="text-xs text-[var(--color-text-secondary)] mt-1.5">{item.description}</p>}
      </div>
      {item.contentBlocks?.length > 0 && <ContentBlockRenderer blocks={item.contentBlocks} />}
    </div>
  );
}

// ─── Improvement resource card ────────────────────────────────────────────────
function ImprovementCard({ item }) {
  return (
    <div className="glass-card p-5 flex flex-col gap-3">
      <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
        <span>💡</span> {item.title}
      </h3>
      {item.contentBlocks?.length > 0 ? (
        <ContentBlockRenderer blocks={item.contentBlocks} />
      ) : (
        <p className="text-xs text-[var(--color-text-muted)] italic">No content yet.</p>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ResumeGuide() {
  const [activeTab, setActiveTab]       = useState('templates');
  const [catFilter, setCatFilter]       = useState('all');
  const [refCatFilter, setRefCatFilter] = useState('');

  const [templates,    setTemplates]    = useState([]);
  const [guide,        setGuide]        = useState([]);
  const [references,   setReferences]   = useState([]);
  const [atsLinks,     setAtsLinks]     = useState([]);
  const [improvement,  setImprovement]  = useState([]);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [t, g, r, a, i] = await Promise.all([
          resumeTemplatesService.getAll(),
          resumeGuideSectionsService.getAll(),
          resumeReferencesService.getAll(),
          atsCheckerLinksService.getAll(),
          resumeImprovementResourcesService.getAll(),
        ]);
        if (!cancelled) {
          setTemplates(t || []);
          setGuide(g || []);
          setReferences(r || []);
          setAtsLinks(a || []);
          setImprovement(i || []);
        }
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || 'Failed to load resume guide.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredTemplates  = catFilter === 'all'   ? templates   : templates.filter(t => t.category === catFilter);
  const filteredReferences = refCatFilter           ? references.filter(r => r.category === refCatFilter) : references;
  const refCategories      = [...new Set(references.map(r => r.category).filter(Boolean))];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12 font-sans">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="font-display text-2xl font-extrabold text-[var(--color-text-primary)]">Resume Guide & ATS Resources</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Department-standard templates, sequential building guide, ATS checkers, and improvement resources.
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20 text-xs text-[var(--color-danger)]">⚠ {error}</div>
      )}

      {/* Tabs with Signature Underline Motif */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            id={`resume-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-display font-bold transition-all relative ${
              activeTab === tab.id
                ? 'text-[var(--color-accent)] signature-underline active'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] signature-underline'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Templates Tab ────────────────────────────────────────────────────── */}
      {activeTab === 'templates' && (
        <div className="flex flex-col gap-5 animate-fade-in">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                  catFilter === cat
                    ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)]'
                    : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-border)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <Skeleton lines={6} />
          ) : filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredTemplates.map(t => <TemplateCard key={t._id} item={t} />)}
            </div>
          ) : (
            <Empty icon="📄" message="No templates available yet." />
          )}
        </div>
      )}

      {/* ── Building Guide Tab (Vertical Progress Rail) ────────────────────── */}
      {activeTab === 'guide' && (
        <div className="flex flex-col gap-6 animate-fade-in relative">
          <div className="px-4 py-3 rounded-xl bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] text-xs text-[var(--color-accent)] font-medium">
            📌 Sections are arranged in the <strong>correct resume order</strong> — follow this sequence.
          </div>

          {/* Left Vertical Progress Rail Line */}
          {guide.length > 0 && (
            <div className="absolute left-3.5 top-16 bottom-6 w-0.5 bg-[var(--color-border)] -z-0" />
          )}

          {loading ? <Skeleton lines={8} /> :
            guide.length > 0
              ? guide.map((s, i) => <GuideSectionCard key={s._id} item={s} index={i} />)
              : <Empty icon="🏗️" message="Building guide coming soon." />
          }
        </div>
      )}

      {/* ── References Tab ───────────────────────────────────────────────────── */}
      {activeTab === 'references' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {refCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setRefCatFilter('')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                  refCatFilter === '' ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)]' : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)]'
                }`}>All</button>
              {refCategories.map(cat => (
                <button key={cat} onClick={() => setRefCatFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                    refCatFilter === cat ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)]' : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)]'
                  }`}>{cat}</button>
              ))}
            </div>
          )}
          {loading ? <Skeleton lines={6} /> :
            filteredReferences.length > 0
              ? <div className="flex flex-col gap-4">{filteredReferences.map(r => <ReferenceCard key={r._id} item={r} />)}</div>
              : <Empty icon="📚" message="No references added yet." />
          }
        </div>
      )}

      {/* ── ATS Checker Tab (2-Column Cards) ──────────────────────────────────── */}
      {activeTab === 'ats' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="px-4 py-3 rounded-xl bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] text-xs text-[var(--color-accent)] font-medium">
            🔍 Use these tools to check your ATS (Applicant Tracking System) score before applying.
          </div>
          {loading ? <Skeleton lines={4} /> :
            atsLinks.length > 0
              ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{atsLinks.map((a, i) => <AtsLinkCard key={a._id} {...a} index={i} />)}</div>
              : <Empty icon="🔍" message="No ATS checker links added yet." />
          }
        </div>
      )}

      {/* ── Improvement Resources Tab ────────────────────────────────────────── */}
      {activeTab === 'improvement' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {loading ? <Skeleton lines={6} /> :
            improvement.length > 0
              ? improvement.map(r => <ImprovementCard key={r._id} item={r} />)
              : <Empty icon="💡" message="Resume improvement resources coming soon." />
          }
        </div>
      )}
    </div>
  );
}
