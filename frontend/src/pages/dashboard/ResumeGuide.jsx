import { useState, useEffect } from 'react';
import resumeTemplatesService         from '../../services/resumeTemplates.service';
import resumeGuideSectionsService     from '../../services/resumeGuideSections.service';
import resumeReferencesService        from '../../services/resumeReferences.service';
import atsCheckerLinksService         from '../../services/atsCheckerLinks.service';
import resumeImprovementResourcesService from '../../services/resumeImprovementResources.service';
import ContentBlockRenderer           from '../../components/shared/ContentBlockRenderer';
import AtsLinkCard                    from '../../components/resumeGuide/AtsLinkCard';

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
      <div className="text-5xl">{icon}</div>
      <p className="text-sm text-[var(--color-text-muted)]">{message}</p>
    </div>
  );
}

// ─── Template card ────────────────────────────────────────────────────────────
function TemplateCard({ item }) {
  const catColors = {
    fresher:     'bg-blue-500/10 text-blue-400',
    experienced: 'bg-purple-500/10 text-purple-400',
    internship:  'bg-amber-500/10 text-amber-400',
    general:     'bg-slate-500/10 text-slate-400',
  };
  return (
    <div className="glass-card flex flex-col overflow-hidden border border-[var(--color-border)] hover:border-red-500/30 transition-all">
      {/* Preview image */}
      <div className="aspect-[3/4] bg-[var(--color-bg-secondary)] flex items-center justify-center overflow-hidden">
        {item.previewImageUrl ? (
          <img src={item.previewImageUrl} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[var(--color-text-muted)]">
            <span className="text-4xl">📄</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">No Preview</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xs font-bold text-[var(--color-text-primary)] leading-tight">{item.title}</h3>
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${catColors[item.category] || catColors.general}`}>
            {item.category}
          </span>
        </div>
        {item.description && <p className="text-[10px] text-[var(--color-text-secondary)] line-clamp-2">{item.description}</p>}

        <a
          href={item.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="mt-1 w-full py-2 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded-lg text-center transition-all"
        >
          ↓ Download {item.fileType?.toUpperCase() || 'File'}
        </a>
      </div>
    </div>
  );
}

// ─── Guide section card ───────────────────────────────────────────────────────
function GuideSectionCard({ item, index }) {
  return (
    <div className="glass-card p-6 border border-[var(--color-border)] hover:border-red-500/20 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 font-black text-sm flex items-center justify-center flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] truncate">{item.sectionTitle}</h3>
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${
            item.isRequired ? 'bg-red-500/10 text-red-500' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]'
          }`}>
            {item.isRequired ? 'Required' : 'Optional'}
          </span>
        </div>
      </div>
      {item.contentBlocks?.length > 0 ? (
        <ContentBlockRenderer blocks={item.contentBlocks} />
      ) : (
        <p className="text-xs text-[var(--color-text-muted)] italic">No content yet for this section.</p>
      )}
    </div>
  );
}

// ─── Reference card ───────────────────────────────────────────────────────────
function ReferenceCard({ item }) {
  return (
    <div className="glass-card p-5 border border-[var(--color-border)] hover:border-red-500/20 transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">{item.title}</h3>
          {item.category && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-0.5 rounded-full mt-0.5 inline-block">
              {item.category}
            </span>
          )}
          {item.description && <p className="text-xs text-[var(--color-text-secondary)] mt-1">{item.description}</p>}
        </div>
      </div>
      {item.contentBlocks?.length > 0 && <ContentBlockRenderer blocks={item.contentBlocks} />}
    </div>
  );
}

// ─── Improvement resource card ────────────────────────────────────────────────
function ImprovementCard({ item }) {
  return (
    <div className="glass-card p-5 border border-[var(--color-border)] hover:border-red-500/20 transition-all">
      <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
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

  // Derived filtered lists
  const filteredTemplates  = catFilter === 'all'   ? templates   : templates.filter(t => t.category === catFilter);
  const filteredReferences = refCatFilter           ? references.filter(r => r.category === refCatFilter) : references;
  const refCategories      = [...new Set(references.map(r => r.category).filter(Boolean))];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Resume Guide & ATS Resources</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Templates, step-by-step building guide, references, ATS checkers, and improvement resources — all in one place
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">⚠ {error}</div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            id={`resume-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg border border-b-0 border-transparent transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--color-surface)] border-[var(--color-border)] text-red-500 -mb-px'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Templates Tab ────────────────────────────────────────────────────── */}
      {activeTab === 'templates' && (
        <div className="flex flex-col gap-5 animate-fade-in">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  catFilter === cat
                    ? 'bg-red-500 text-white'
                    : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-red-500/30'
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
            <Empty icon="📄" message="No templates available yet. Check back soon." />
          )}
        </div>
      )}

      {/* ── Building Guide Tab ───────────────────────────────────────────────── */}
      {activeTab === 'guide' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/20 text-xs text-red-400">
            📌 Sections are arranged in the <strong>correct resume order</strong> — follow this sequence for best results.
          </div>
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
          {/* Category filter (dynamic from data) */}
          {refCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setRefCatFilter('')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  refCatFilter === '' ? 'bg-red-500 text-white' : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-red-500/30'
                }`}>All</button>
              {refCategories.map(cat => (
                <button key={cat} onClick={() => setRefCatFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    refCatFilter === cat ? 'bg-red-500 text-white' : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-red-500/30'
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

      {/* ── ATS Checker Tab ──────────────────────────────────────────────────── */}
      {activeTab === 'ats' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="px-4 py-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-blue-400">
            🔍 Use these tools to check your ATS (Applicant Tracking System) score before applying to companies.
          </div>
          {loading ? <Skeleton lines={4} /> :
            atsLinks.length > 0
              ? <div className="flex flex-col gap-3">{atsLinks.map((a, i) => <AtsLinkCard key={a._id} {...a} index={i} />)}</div>
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
