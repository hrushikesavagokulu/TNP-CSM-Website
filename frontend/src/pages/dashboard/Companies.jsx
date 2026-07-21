import { useState, useEffect, useCallback, useMemo } from 'react';
import companyInfoService from '../../services/companyInfo.service';
import ContentBlockRenderer from '../../components/shared/ContentBlockRenderer';

const STATUS_TABS = [
  { id: 'completed', label: 'Completed Drives' },
  { id: 'ongoing',   label: 'Ongoing Drives' },
  { id: 'upcoming',  label: 'Upcoming Drives' },
];

export default function Companies() {
  const [activeStatus, setActiveStatus] = useState('completed');
  const [companies, setCompanies]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [detailLoading, setDetailLoading]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await companyInfoService.getCompanies(activeStatus);
      setCompanies(data);
    } catch (err) {
      console.error('[Companies] Error fetching:', err);
    } finally {
      setLoading(false);
    }
  }, [activeStatus]);

  useEffect(() => { load(); }, [load]);

  const handleOpenDetail = async (comp) => {
    setDetailLoading(true);
    setSelectedCompany(comp);
    try {
      const full = await companyInfoService.getCompanyById(comp._id);
      setSelectedCompany(full);
    } catch (err) {
      console.error('[Companies] Error fetching detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Client-side grouping by academicYear for completed drives
  const groupedByYear = useMemo(() => {
    if (activeStatus !== 'completed') return {};
    return companies.reduce((acc, comp) => {
      const year = comp.academicYear || 'Other';
      if (!acc[year]) acc[year] = [];
      acc[year].push(comp);
      return acc;
    }, {});
  }, [companies, activeStatus]);

  // Compute stats per academic year
  const getYearStats = (yearItems) => {
    const totalPlaced = yearItems.reduce((sum, c) => sum + (c.totalCleared || 0), 0);
    const ctcList = yearItems.map(c => c.ctc).filter(Boolean);
    const rolesList = Array.from(new Set(yearItems.flatMap(c => c.roles || [])));
    return {
      placed: totalPlaced,
      ctcRange: ctcList.length ? ctcList.join(', ') : 'N/A',
      rolesCount: rolesList.length,
      rolesSummary: rolesList.slice(0, 3).join(', ') + (rolesList.length > 3 ? '...' : ''),
    };
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* ── Top Header ──────────────────────────────────────────────────────────── */}
      <div className="glass-card p-6 border border-[var(--color-border)] bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-bg-secondary)]/40 to-[var(--color-surface)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
              🏢
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[var(--color-text-primary)]">
                Company Placement Drives
              </h1>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Placement drives, round-by-round statistics, technical assessment topics, and linked alumni repositories.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lifecycle Status Tabs ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveStatus(tab.id); setSelectedCompany(null); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
              activeStatus === tab.id
                ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-md shadow-[var(--color-accent)]/20 scale-[1.02]'
                : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]/50 hover:text-[var(--color-text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Main Content Area ───────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-[var(--color-bg-secondary)] animate-pulse" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="glass-card p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-3xl flex items-center justify-center mb-3">
            🏢
          </div>
          <h3 className="text-base font-bold text-[var(--color-text-primary)]">No {activeStatus} company drives found</h3>
          <p className="text-xs text-[var(--color-text-muted)] max-w-md mt-1">
            Companies registered for placement drives will appear here under their respective status.
          </p>
        </div>
      ) : activeStatus === 'completed' ? (
        /* ── Completed Category: Grouped by Academic Year ─────────────────────── */
        <div className="flex flex-col gap-8">
          {Object.entries(groupedByYear).map(([year, yearCompanies]) => {
            const stats = getYearStats(yearCompanies);
            return (
              <div key={year} className="flex flex-col gap-4">
                {/* Year Header & Aggregated Stats Summary Box */}
                <div className="glass-card p-4 border-l-4 border-l-[var(--color-accent)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)]">
                  <div>
                    <h2 className="text-base font-black text-[var(--color-text-primary)] flex items-center gap-2">
                      <span>Academic Year {year}</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                        {yearCompanies.length} Compan{yearCompanies.length !== 1 ? 'ies' : 'y'}
                      </span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-6 text-xs flex-wrap">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Students Placed</span>
                      <span className="font-extrabold text-emerald-500 text-sm">{stats.placed} Selected</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">CTC Offered</span>
                      <span className="font-extrabold text-[var(--color-text-primary)]">{stats.ctcRange}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Key Roles</span>
                      <span className="font-bold text-[var(--color-text-secondary)]">{stats.rolesSummary || 'Multiple'}</span>
                    </div>
                  </div>
                </div>

                {/* Company Cards Grid for this year */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {yearCompanies.map((comp) => (
                    <div
                      key={comp._id}
                      onClick={() => handleOpenDetail(comp)}
                      className="glass-card p-5 border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-base font-black text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                            {comp.name}
                          </h3>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            comp.offlineOrOnline === 'online'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {comp.offlineOrOnline || 'offline'}
                          </span>
                        </div>
                        {comp.driveDate && (
                          <p className="text-[11px] text-[var(--color-text-muted)] font-medium mb-3">
                            📅 Drive Date: {new Date(comp.driveDate).toLocaleDateString()}
                          </p>
                        )}
                        {comp.description && (
                          <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mb-4">
                            {comp.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-bold">
                        <div>
                          <span className="text-[10px] text-[var(--color-text-muted)] block">CTC Package</span>
                          <span className="text-[var(--color-accent)] font-extrabold">{comp.ctc || 'N/A'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-[var(--color-text-muted)] block">Placed</span>
                          <span className="text-emerald-500 font-extrabold">{comp.totalCleared || 0} Students</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Upcoming & Ongoing Drives List ───────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((comp) => (
            <div
              key={comp._id}
              onClick={() => handleOpenDetail(comp)}
              className="glass-card p-5 border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-black text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                    {comp.name}
                  </h3>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    activeStatus === 'ongoing'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                      : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  }`}>
                    {activeStatus}
                  </span>
                </div>
                {comp.driveDate && (
                  <p className="text-[11px] text-[var(--color-text-muted)] font-medium mb-3">
                    📅 Drive Date: {new Date(comp.driveDate).toLocaleDateString()}
                  </p>
                )}
                {comp.description && (
                  <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mb-4">
                    {comp.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-bold">
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] block">CTC Package</span>
                  <span className="text-[var(--color-accent)] font-extrabold">{comp.ctc || 'N/A'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[var(--color-text-muted)] block">Mode</span>
                  <span className="text-[var(--color-text-primary)] uppercase font-extrabold">{comp.offlineOrOnline || 'Offline'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Company Detail Modal ────────────────────────────────────────────────── */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 flex flex-col gap-6 relative border border-[var(--color-border)] shadow-2xl animate-fade-in my-8">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedCompany(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-sm font-bold flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            {detailLoading ? (
              <div className="p-12 text-center flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin" />
                <p className="text-xs text-[var(--color-text-muted)] animate-pulse">Loading complete drive details & alumni data...</p>
              </div>
            ) : (
              <>
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4 pr-8">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-black text-[var(--color-text-primary)]">
                        {selectedCompany.name}
                      </h2>
                      <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20">
                        {selectedCompany.status}
                      </span>
                    </div>
                    {selectedCompany.academicYear && (
                      <p className="text-xs text-[var(--color-text-muted)] mt-1 font-semibold">
                        Academic Year: {selectedCompany.academicYear} · Mode: {selectedCompany.offlineOrOnline || 'Offline'}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col sm:items-end">
                    <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase">Package / CTC</span>
                    <span className="text-xl font-black text-[var(--color-accent)]">{selectedCompany.ctc || 'N/A'}</span>
                  </div>
                </div>

                {/* Basic Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCompany.description && (
                    <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border)]">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Company Description</h4>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{selectedCompany.description}</p>
                    </div>
                  )}
                  {selectedCompany.aboutCompany && (
                    <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border)]">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">About Company</h4>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{selectedCompany.aboutCompany}</p>
                    </div>
                  )}
                  {selectedCompany.eligibilityCriteria && (
                    <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border)] md:col-span-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Eligibility Criteria</h4>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{selectedCompany.eligibilityCriteria}</p>
                    </div>
                  )}
                  {selectedCompany.roles?.length > 0 && (
                    <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border)] md:col-span-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Offered Roles</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCompany.roles.map((r, idx) => (
                          <span key={idx} className="text-xs font-bold px-3 py-1 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)]">
                            💼 {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Recruitment Process & Technical Flow */}
                {(selectedCompany.recruitmentProcess || selectedCompany.prevYearProcess) && (
                  <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)]/40 border border-[var(--color-border)] flex flex-col gap-3">
                    {selectedCompany.recruitmentProcess && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)] mb-1">Recruitment Process</h4>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">{selectedCompany.recruitmentProcess}</p>
                      </div>
                    )}
                    {selectedCompany.prevYearProcess && (
                      <div className="pt-2 border-t border-[var(--color-border)]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)] mb-1">Previous Year Recruitment & Technical Assessment Flow</h4>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">{selectedCompany.prevYearProcess}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Round-by-Round Progression & Elimination Table */}
                {selectedCompany.rounds?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-[var(--color-text-primary)] mb-3">
                      Round-by-Round Progression & Statistics
                    </h3>
                    <div className="overflow-x-auto border border-[var(--color-border)] rounded-xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase tracking-wider text-[10px]">
                            <th className="p-3">Round Name</th>
                            <th className="p-3">Attempted</th>
                            <th className="p-3">Passed</th>
                            <th className="p-3">Eliminated</th>
                            <th className="p-3">Focus Topics & Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                          {selectedCompany.rounds.map((rd) => (
                            <tr key={rd._id} className="hover:bg-[var(--color-bg-secondary)]/40 transition-colors">
                              <td className="p-3 font-bold text-[var(--color-text-primary)]">{rd.roundName}</td>
                              <td className="p-3 font-semibold">{rd.attended ?? 0}</td>
                              <td className="p-3 font-bold text-emerald-500">{rd.passed ?? 0}</td>
                              <td className="p-3 font-semibold text-rose-400">{rd.eliminated ?? Math.max(0, (rd.attended ?? 0) - (rd.passed ?? 0))}</td>
                              <td className="p-3 text-[var(--color-text-secondary)] max-w-xs">
                                {rd.focusTopics?.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-1">
                                    {rd.focusTopics.map((t, idx) => (
                                      <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold">
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {rd.details && <p className="text-[11px] italic">{rd.details}</p>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Reused ContentBlockRenderer for Previous Year Questions & Materials */}
                {selectedCompany.prevYearQuestions?.length > 0 && (
                  <div className="p-4 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)]">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-accent)] mb-3">
                      Previous Year Questions & Study Materials
                    </h3>
                    <ContentBlockRenderer blocks={selectedCompany.prevYearQuestions} />
                  </div>
                )}

                {/* Linked Alumni Repositories at Bottom */}
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                    🎓 Alumni Secured at {selectedCompany.name}
                  </h3>

                  {!selectedCompany.linkedAlumniRepos || selectedCompany.linkedAlumniRepos.length === 0 ? (
                    <p className="text-xs text-[var(--color-text-muted)] italic">
                      No alumni repository profiles linked to this company drive yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedCompany.linkedAlumniRepos.map((alum) => (
                        <div key={alum._id} className="p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg-secondary)]/30 flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-bold text-sm flex items-center justify-center flex-shrink-0">
                            {alum.profileImage ? (
                              <img src={alum.profileImage} alt={alum.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              alum.name?.charAt(0) || '🎓'
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-[var(--color-text-primary)] truncate">{alum.name}</h4>
                            <p className="text-[10px] text-[var(--color-text-muted)]">{alum.rollNo}</p>
                            <div className="flex gap-2 mt-2">
                              {alum.linkedin && (
                                <a href={alum.linkedin} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 font-semibold hover:underline">
                                  LinkedIn ↗
                                </a>
                              )}
                              {alum.github && (
                                <a href={alum.github} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[var(--color-text-primary)] font-semibold hover:underline">
                                  GitHub ↗
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
