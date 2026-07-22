import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import publicService from '../../services/public.service';
import Footer from '../../components/layout/Footer';

// Static laboratory configuration details
const LABS_LIST = [
  { name: 'CSM Lab 1', desc: 'Equipped with latest configured Lenovo ThinkCenter Neo PCs (i5 12th Gen, 16GB RAM, 512GB SSD) enabling programming in C, Java, and Python.' },
  { name: 'CSM Lab 2', desc: 'Equipped with Lenovo ThinkCenter Neo Intel Core i5 PCs running licensed tools for DBMS, Data Mining, and Machine Learning algorithms.' },
  { name: 'CSM Lab 3', desc: 'Dedicated programming lab environment with high-speed compiler setups for OOPs, Java, and script scripting practices.' },
  { name: 'CSM Lab 4', desc: 'Equipped with advanced database managers and analytical model setups for SQL, DBMS, and mining projects.' },
  { name: 'CSM Lab 5', desc: 'Focused high-tier laboratory with configurations optimized for Deep Learning models, NLP frameworks, and AI workflows.' },
  { name: 'CSM Lab 6 (Intel Unnati Lab)', desc: 'Preeminent center of excellence for training ML, Deep Neural Networks, NLP execution, and artificial intelligence programs.' },
  { name: 'CSM Lab 7 (Internship Lab)', desc: 'Dedicated space for project work, real-world internships, and industry-sponsored collaboration activities.' },
  { name: 'CSM Lab 8 (Placement Training)', desc: 'Conducts intensive technical training, mock interviews, and assessment platforms to ready students for core placements.' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('faculty');
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  // ── React Query fetches ───────────────────────────────────────────────────
  const { data: deptInfo, isLoading: infoLoading } = useQuery({
    queryKey: ['public-dept-info'],
    queryFn: publicService.getDepartmentInfo,
    staleTime: 5 * 60 * 1000,
  });

  const { data: facultyLinks, isLoading: facultyLoading } = useQuery({
    queryKey: ['public-faculty-links'],
    queryFn: publicService.getFacultyLinks,
    staleTime: 5 * 60 * 1000,
  });

  const { data: schemeLinks, isLoading: schemeLoading } = useQuery({
    queryKey: ['public-scheme-links'],
    queryFn: publicService.getSchemeLinks,
    staleTime: 5 * 60 * 1000,
  });

  const loading = infoLoading || facultyLoading || schemeLoading;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors duration-250 flex flex-col justify-between animate-fade-in font-sans">
      
      {/* Main content body */}
      <div className="flex-1">
        
        {/* 1. Hero banner section */}
        <div className="w-full relative h-[420px] sm:h-[520px] lg:h-[580px] overflow-hidden bg-slate-900 flex items-center justify-center border-b border-[var(--color-border)] transition-all">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800 animate-pulse">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading department details...</span>
            </div>
          ) : deptInfo?.heroImageUrl ? (
            <>
              <img
                src={deptInfo.heroImageUrl}
                alt="CSM Department Banner"
                className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-red-900/45 to-slate-950">
              <h2 className="text-white text-2xl sm:text-3xl font-black tracking-wide uppercase">CSE (Artificial Intelligence & Machine Learning)</h2>
              <p className="text-red-400 font-semibold text-xs tracking-widest uppercase mt-2">G. Pulla Reddy Engineering College (Autonomous)</p>
            </div>
          )}
          
          {deptInfo?.heroImageUrl && !loading && (
            <div className="absolute bottom-6 left-6 right-6 max-w-7xl mx-auto z-10 text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                Welcome to CSM
              </span>
              <h2 className="text-white text-xl sm:text-3xl font-black mt-2 leading-tight drop-shadow-sm uppercase">
                Computer Science & Engineering (AI & ML)
              </h2>
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-10">

          {/* 2. Motto, Vision & Mission Two-Column Block */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Motto */}
            <div className="glass-card p-6 border-l-4 border-red-500 bg-red-500/5 flex flex-col justify-center">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-red-500">Our Motto</h3>
              <p className="text-sm sm:text-base font-bold text-[var(--color-text-primary)] mt-3 leading-relaxed italic">
                {deptInfo?.motto || 'CSE- Artificial Intelligence and Machine Learning Department helps its students to enrich their abilities by encouraging critical thinking through programming skills.'}
              </p>
            </div>

            {/* Vision & Mission */}
            <div className="flex flex-col justify-between gap-4">
              <div className="glass-card p-5 flex-1">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-1.5">
                  <span>🎯</span> Vision
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-2 leading-relaxed font-medium">
                  {deptInfo?.vision || 'To be a center of excellence in education, research, and innovation in emerging Computer Science technologies while fostering leadership, ethics, and social responsibility.'}
                </p>
              </div>

              <div className="glass-card p-5 flex-1">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-1.5">
                  <span>⚡</span> Mission
                </h3>
                <div className="text-xs text-[var(--color-text-secondary)] mt-2 leading-relaxed font-medium flex flex-col gap-1.5">
                  {deptInfo?.mission ? (
                    <p className="whitespace-pre-line">{deptInfo.mission}</p>
                  ) : (
                    <>
                      <p>• Deliver industry-relevant, outcome-based education to facilitate competent learning.</p>
                      <p>• Inculcate interest on research and innovation through critical thinking.</p>
                      <p>• Impart values and ethics for prospective and promising engineers.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 3. Navigation Tabs Bar */}
          <section className="flex flex-col gap-6 mt-4">
            
            {/* Tabs selectors */}
            <div className="flex border-b border-[var(--color-border)] gap-2">
              <button
                onClick={() => setActiveTab('faculty')}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'faculty'
                    ? 'border-red-500 text-red-500'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                👥 Faculty Profiles
              </button>
              <button
                onClick={() => setActiveTab('syllabus')}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'syllabus'
                    ? 'border-red-500 text-red-500'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                📄 Syllabus & Schemes
              </button>
              <button
                onClick={() => setActiveTab('laboratories')}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'laboratories'
                    ? 'border-red-500 text-red-500'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                🖥️ Infrastructure & Labs
              </button>
            </div>

            {/* Tab 1: Faculty list */}
            {activeTab === 'faculty' && (
              <div className="animate-fade-in flex flex-col gap-6">
                <div>
                  <h4 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                    CSE (AI & ML) Faculty Profile Directory
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Complete listing of HOD, Professors, and Lecturers. Click on any card to view detailed credentials overlay.
                  </p>
                </div>

                {facultyLinks && facultyLinks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {facultyLinks.map((fac) => (
                      <div
                        key={fac._id}
                        onClick={() => setSelectedFaculty(fac)}
                        className={`glass-card p-5 flex flex-col justify-between gap-4 border-t-2 relative cursor-pointer hover:border-red-500/50 hover:shadow-lg transition-all transform hover:-translate-y-0.5 ${
                          fac.isGuest ? 'border-amber-500 bg-amber-500/[0.01]' : 'border-red-500'
                        }`}
                      >
                        {fac.isGuest && (
                          <span className="absolute top-3 right-3 text-[8px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            Guest Faculty
                          </span>
                        )}

                        <div className="flex flex-col gap-3">
                          {/* Profile Header Row with Photo */}
                          <div className="flex items-center gap-3">
                            {fac.imageUrl ? (
                              <img
                                src={fac.imageUrl}
                                alt={fac.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-[var(--color-border)] shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/10 border-2 border-[var(--color-border)] text-red-500 flex items-center justify-center font-black text-sm uppercase">
                                {fac.name.split('.').pop().trim().charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-[var(--color-text-primary)] truncate">{fac.name}</h5>
                              <p className="text-[9px] text-red-500 font-semibold uppercase tracking-wider truncate">{fac.designation}</p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 mt-1 text-[11px]">
                            {fac.qualifications && (
                              <p className="text-[10px] text-[var(--color-text-secondary)] font-medium">
                                🎓 Qualifications: <span className="text-[var(--color-text-primary)]">{fac.qualifications}</span>
                              </p>
                            )}
                            {fac.researchInterest && (
                              <p className="text-[10px] text-[var(--color-text-secondary)] font-medium leading-relaxed truncate">
                                🔬 Research: <span className="text-[var(--color-text-primary)] font-semibold">{fac.researchInterest}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest self-end hover:underline">
                          View Details ➔
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--color-text-muted)] italic py-8 text-center">
                    No faculty details loaded yet. Complete the seed setup to populate profiles.
                  </p>
                )}
              </div>
            )}

            {/* Tab 2: Syllabus schemes */}
            {activeTab === 'syllabus' && (
              <div className="animate-fade-in flex flex-col gap-6">
                <div>
                  <h4 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                    Syllabus, Regulations & Academic Schemes
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Download and view batch schemes for CSM batches.
                  </p>
                </div>

                {schemeLinks && schemeLinks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schemeLinks.map((scheme) => (
                      <a
                        key={scheme._id}
                        href={scheme.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-card p-6 flex items-center justify-between gap-4 no-underline hover:border-red-500/30 hover:shadow-md transition-all group"
                      >
                        <div className="min-w-0">
                          <span className="text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-0.5 rounded">
                            {scheme.schemeYear}
                          </span>
                          <h4 className="text-xs font-bold text-[var(--color-text-primary)] mt-2 group-hover:text-red-500 transition-colors truncate">
                            {scheme.title}
                          </h4>
                          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Click to view syllabus PDF</p>
                        </div>
                        <div className="text-lg text-[var(--color-text-muted)] group-hover:text-red-500 transition-colors">
                          📄
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--color-text-muted)] italic py-8 text-center">
                    No academic scheme syllabus cards loaded yet.
                  </p>
                )}
              </div>
            )}

            {/* Tab 3: Laboratories */}
            {activeTab === 'laboratories' && (
              <div className="animate-fade-in flex flex-col gap-6">
                <div>
                  <h4 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                    Infrastructure & Practical Laboratories
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Our high-performance computer laboratories equipped with core compilers, GPU servers, and AI frameworks.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {LABS_LIST.map((lab, index) => (
                    <div key={index} className="glass-card p-5 hover:-translate-y-0.5 transition-all flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🖥️</span>
                        <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">{lab.name}</h4>
                      </div>
                      <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed mt-1">
                        {lab.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </section>

        </div>

      </div>

      {/* 4. Faculty credentials Overlay Modal */}
      {selectedFaculty && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row animate-scale-up">
            
            {/* Close button */}
            <button
              onClick={() => setSelectedFaculty(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[var(--color-bg-secondary)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] flex items-center justify-center font-bold focus:outline-none transition-colors"
            >
              ✕
            </button>

            {/* Left side profile photo */}
            <div className="md:w-2/5 bg-[var(--color-bg-secondary)]/30 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[var(--color-border)]/50 min-h-[220px]">
              {selectedFaculty.imageUrl ? (
                <img
                  src={selectedFaculty.imageUrl}
                  alt={selectedFaculty.name}
                  className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover border-4 border-[var(--color-surface)] shadow-md"
                />
              ) : (
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/10 border-4 border-[var(--color-surface)] text-red-500 flex items-center justify-center font-black text-4xl shadow-md">
                  {selectedFaculty.name.split('.').pop().trim().charAt(0)}
                </div>
              )}

              <h4 className="text-xs font-bold text-[var(--color-text-primary)] mt-4 text-center">{selectedFaculty.name}</h4>
              <span className="text-[9px] font-black uppercase tracking-wider text-red-500 mt-1 text-center bg-red-500/5 border border-red-500/10 px-2 py-0.5 rounded-full">
                {selectedFaculty.designation}
              </span>
            </div>

            {/* Right side credentials content */}
            <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-3.5">
                <span className="text-[8px] font-black uppercase tracking-widest text-[var(--color-text-muted)] block">
                  Faculty Credentials Directory
                </span>

                <div className="flex flex-col gap-2.5 text-xs text-[var(--color-text-secondary)]">
                  {selectedFaculty.qualifications && (
                    <div className="flex gap-2">
                      <span className="font-bold text-[var(--color-text-primary)] min-w-[90px]">Qualifications:</span>
                      <span className="font-medium">{selectedFaculty.qualifications}</span>
                    </div>
                  )}
                  {selectedFaculty.researchInterest && (
                    <div className="flex gap-2">
                      <span className="font-bold text-[var(--color-text-primary)] min-w-[90px]">Research:</span>
                      <span className="font-medium leading-relaxed">{selectedFaculty.researchInterest}</span>
                    </div>
                  )}
                  {selectedFaculty.apaarId && (
                    <div className="flex gap-2">
                      <span className="font-bold text-[var(--color-text-primary)] min-w-[90px]">APAAR ID:</span>
                      <span className="font-mono">{selectedFaculty.apaarId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom links and profiles */}
              <div className="pt-4 border-t border-[var(--color-border)]/50 flex flex-col gap-3">
                <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                  {selectedFaculty.googleScholar && (
                    <a
                      href={selectedFaculty.googleScholar}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 rounded-lg no-underline transition-all"
                    >
                      Google Scholar Profile
                    </a>
                  )}
                  {selectedFaculty.vidwanProfile && (
                    <a
                      href={selectedFaculty.vidwanProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-lg no-underline transition-all"
                    >
                      Vidwan Profile Link
                    </a>
                  )}
                </div>

                {selectedFaculty.email && (
                  <a
                    href={`mailto:${selectedFaculty.email}`}
                    className="text-xs text-[var(--color-accent)] font-semibold hover:underline flex items-center gap-1.5"
                  >
                    📧 Contact: {selectedFaculty.email}
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

    </div>
  );
}
