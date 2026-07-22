import { useState, useEffect, useCallback } from 'react';
import alumniRepoService from '../../services/alumniRepo.service';
import companyInfoService from '../../services/companyInfo.service';
import ClickableImage from '../../components/shared/ClickableImage';

export default function AlumniRepos() {
  const [alumni, setAlumni]         = useState([]);
  const [companies, setCompanies]   = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [loading, setLoading]       = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [alumniData, compData] = await Promise.all([
        alumniRepoService.getAlumniRepos(selectedCompanyId),
        companyInfoService.getCompanies(),
      ]);
      setAlumni(alumniData);
      setCompanies(compData);
    } catch (err) {
      console.error('[AlumniRepos] Error loading:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* ── Top Header ──────────────────────────────────────────────────────────── */}
      <div className="glass-card p-6 border border-[var(--color-border)] bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-bg-secondary)]/40 to-[var(--color-surface)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
              🎓
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[var(--color-text-primary)]">
                Alumni Repository
              </h1>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Browse placement reviews, interview experiences, questions, and preparation tips from placed alumni.
              </p>
            </div>
          </div>

          {/* Filter By Company Dropdown */}
          <div className="w-full sm:w-64">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">
              Filter by Company
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs font-semibold focus:outline-none focus:border-[var(--color-accent)]"
            >
              <option value="">All Companies</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.academicYear || 'All Years'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Alumni Cards Grid ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-[var(--color-bg-secondary)] animate-pulse" />
          ))}
        </div>
      ) : alumni.length === 0 ? (
        <div className="glass-card p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-3xl flex items-center justify-center mb-3">
            🎓
          </div>
          <h3 className="text-base font-bold text-[var(--color-text-primary)]">No alumni profiles found</h3>
          <p className="text-xs text-[var(--color-text-muted)] max-w-md mt-1">
            Alumni profiles and interview preparation reviews will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alumni.map((alum) => {
            const isExpanded = expandedId === alum._id;
            return (
              <div
                key={alum._id}
                className={`glass-card p-5 border transition-all duration-300 flex flex-col justify-between ${
                  isExpanded ? 'border-[var(--color-accent)] shadow-xl col-span-1 md:col-span-2 lg:col-span-3' : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50'
                }`}
              >
                <div>
                  {/* Card Header Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-border)] text-[var(--color-accent)] font-bold text-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {alum.profileImage ? (
                        <ClickableImage src={alum.profileImage} alt={alum.name} className="w-full h-full object-cover" />
                      ) : (
                        alum.name?.charAt(0) || '🎓'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-black text-[var(--color-text-primary)] truncate">{alum.name}</h3>
                      {alum.rollNo && <p className="text-xs text-[var(--color-text-muted)] font-mono">{alum.rollNo}</p>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {alum.linkedin && (
                          <a
                            href={alum.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
                          >
                            LinkedIn ↗
                          </a>
                        )}
                        {alum.github && (
                          <a
                            href={alum.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
                          >
                            GitHub ↗
                          </a>
                        )}
                        {alum.email && (
                          <a
                            href={`mailto:${alum.email}`}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          >
                            ✉ Email
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Companies Secured Badges */}
                  <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">
                      Companies Secured ({alum.companiesSecured?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {alum.companiesSecured?.map((c, idx) => (
                        <span key={idx} className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20">
                          🏢 {c.company?.name || 'Company'} {c.offerType ? `(${c.offerType})` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Expanded Details: Per-Company Reviews, Interview Questions, and Tips */}
                {isExpanded && (
                  <div className="pt-4 border-t border-[var(--color-border)] flex flex-col gap-4 mt-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-accent)]">
                      Detailed Interview Preparation & Reviews
                    </h4>
                    {alum.companiesSecured?.map((c, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border)] flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                          <span className="text-xs font-black text-[var(--color-text-primary)]">
                            🏢 {c.company?.name || 'Company'} — {c.offerType || 'Full-Time'}
                          </span>
                          {c.ctc && <span className="text-xs font-extrabold text-[var(--color-accent)]">{c.ctc}</span>}
                        </div>

                        {c.reviews && (
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Company Review & Process</span>
                            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">{c.reviews}</p>
                          </div>
                        )}

                        {c.interviewQuestions?.length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Interview Questions Asked</span>
                            <div className="flex flex-wrap gap-1.5">
                              {c.interviewQuestions.map((q, qIdx) => (
                                <span key={qIdx} className="text-xs px-2.5 py-1 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-medium">
                                  ❓ {q}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {c.tips && (
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Preparation Tips for Juniors</span>
                            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed italic">💡 "{c.tips}"</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Toggle Button */}
                <div className="pt-3 border-t border-[var(--color-border)] flex justify-end mt-2">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : alum._id)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent)] transition-all"
                  >
                    {isExpanded ? 'Hide Reviews ▲' : 'View Placement Experience ▼'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
