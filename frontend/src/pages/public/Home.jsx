import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import publicService from '../../services/public.service';
import Footer from '../../components/layout/Footer';
import ClickableImage from '../../components/shared/ClickableImage';

// ── Static laboratory configuration details ──────────────────────────────────
const LABS_LIST = [
  { id: 'LAB-01', name: 'CSM Lab 1', desc: 'Equipped with latest Lenovo ThinkCenter Neo PCs (i5 12th Gen, 16GB RAM, 512GB SSD) enabling programming in C, Java, and Python.', specs: ['Lenovo Neo i5', '16GB RAM', 'Python 3', 'JDK 17'] },
  { id: 'LAB-02', name: 'CSM Lab 2', desc: 'Equipped with Lenovo ThinkCenter Neo Intel Core i5 PCs running licensed tools for DBMS, Data Mining, and Machine Learning algorithms.', specs: ['DBMS Tools', 'Data Mining', 'Oracle DB', 'Weka'] },
  { id: 'LAB-03', name: 'CSM Lab 3', desc: 'Dedicated programming lab environment with high-speed compiler setups for OOPs, Java, and script scripting practices.', specs: ['GCC Compiler', 'Java SDK', 'Linux OS', 'VS Code'] },
  { id: 'LAB-04', name: 'CSM Lab 4', desc: 'Equipped with advanced database managers and analytical model setups for SQL, DBMS, and mining projects.', specs: ['MySQL Enterprise', 'MongoDB', 'R Studio', 'PostgreSQL'] },
  { id: 'LAB-05', name: 'CSM Lab 5', desc: 'Focused high-tier laboratory with configurations optimized for Deep Learning models, NLP frameworks, and AI workflows.', specs: ['NVIDIA CUDA', 'PyTorch', 'TensorFlow', 'Jupyter'] },
  { id: 'LAB-06', name: 'CSM Lab 6 (Intel Unnati Lab)', desc: 'Preeminent center of excellence for training ML, Deep Neural Networks, NLP execution, and artificial intelligence programs.', specs: ['Intel Unnati AI', 'OpenVINO', 'Neural Engine', 'Edge AI'] },
  { id: 'LAB-07', name: 'CSM Lab 7 (Internship Lab)', desc: 'Dedicated space for project work, real-world internships, and industry-sponsored collaboration activities.', specs: ['Project Work', 'Industry Labs', 'Git Hub', 'Docker'] },
  { id: 'LAB-08', name: 'CSM Lab 8 (Placement Training)', desc: 'Conducts intensive technical training, mock interviews, and assessment platforms to ready students for core placements.', specs: ['Placement Prep', 'Mock Test', 'Aptitude', 'DSA Practice'] },
];

// ── Hero Animated Stat Counters ───────────────────────────────────────────────
function AnimatedStat({ value, label, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const end = parseInt(value, 10);
          const duration = 1200;
          const stepTime = Math.abs(Math.floor(duration / end));
          const timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start >= end) clearInterval(timer);
          }, Math.max(stepTime, 16));
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="flex flex-col items-center sm:items-start">
      <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[var(--color-accent)]">
        {count}{suffix}
      </span>
      <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--color-text-muted)] mt-0.5">
        {label}
      </span>
    </div>
  );
}

export default function Home() {
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  // ── React Query fetches ────────────────────────────────────────────────────
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
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors duration-220 flex flex-col justify-between animate-fade-in font-sans">
      
      {/* Main content body */}
      <div className="flex-1">
        
        {/* 1. Hero banner section */}
        <div className="w-full relative h-[420px] sm:h-[520px] lg:h-[580px] overflow-hidden bg-slate-950 flex items-center justify-center border-b border-[var(--color-border)]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 animate-pulse">
              <span className="text-slate-400 text-xs font-mono font-bold uppercase tracking-widest">Loading department details...</span>
            </div>
          ) : deptInfo?.heroImageUrl ? (
            <>
              <img
                src={deptInfo.heroImageUrl}
                alt="CSM Department Banner"
                className="w-full h-full object-cover opacity-85 transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-black via-slate-900 to-slate-950">
              <h2 className="text-white font-display text-2xl sm:text-4xl font-black tracking-tight uppercase">
                CSE (Artificial Intelligence & Machine Learning)
              </h2>
              <p className="text-[var(--color-accent)] font-mono font-semibold text-xs tracking-widest uppercase mt-3">
                G. Pulla Reddy Engineering College (Autonomous)
              </p>
            </div>
          )}
          
          {/* Overlay Title Box */}
          <div className="absolute bottom-6 left-6 right-6 max-w-7xl mx-auto z-10 text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-accent)] bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] px-2.5 py-1 rounded-full">
                Department of Record
              </span>
              <h1 className="text-white font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold mt-3 leading-tight tracking-tight uppercase drop-shadow-md">
                Computer Science & Engineering (AI & ML)
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm font-medium mt-2 max-w-2xl line-clamp-2">
                Enriching student abilities through critical thinking, specialized programming, and core artificial intelligence research.
              </p>
            </div>

            {/* Signature Hero Stats Counters */}
            <div className="flex items-center gap-6 p-4 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md flex-shrink-0">
              <AnimatedStat value="247" label="Placed" />
              <div className="h-8 w-px bg-white/20" />
              <AnimatedStat value="38" label="Companies" />
              <div className="h-8 w-px bg-white/20" />
              <AnimatedStat value="92" label="Pass Rate" suffix="%" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-16">

          {/* 2. Motto, Vision & Mission Two-Column Block */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch section-rhythm">
            {/* Motto */}
            <div className="glass-card p-8 border-l-4 border-[var(--color-accent)] bg-[var(--color-accent-subtle)]/30 flex flex-col justify-center">
              <span className="font-display text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                Our Motto
              </span>
              <p className="text-sm sm:text-base font-bold text-[var(--color-text-primary)] mt-4 leading-relaxed italic">
                "{deptInfo?.motto || 'CSE- Artificial Intelligence and Machine Learning Department helps its students to enrich their abilities by encouraging critical thinking through programming skills.'}"
              </p>
            </div>

            {/* Vision & Mission */}
            <div className="flex flex-col justify-between gap-4">
              <div className="glass-card p-6 flex-1">
                <span className="font-display text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] block mb-2">
                  VISION
                </span>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-medium">
                  {deptInfo?.vision || 'To become a globally recognized center of excellence in Artificial Intelligence and Machine Learning education, nurturing innovation, research, and ethics.'}
                </p>
              </div>

              <div className="glass-card p-6 flex-1">
                <span className="font-display text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] block mb-2">
                  MISSION
                </span>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-medium">
                  {deptInfo?.mission || 'To impart high-quality technical education in AI & ML, foster industry-academia collaboration, and empower students to solve real-world problems responsibly.'}
                </p>
              </div>
            </div>
          </section>

          {/* 3. Department Overview & Quick Stats */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start section-rhythm">
            {/* Left 2-Cols: About Department */}
            <div className="lg:col-span-2 glass-card p-8 flex flex-col gap-4">
              <span className="font-display text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                About the Department
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                Pioneering AI & Machine Learning Excellence
              </h2>
              <div className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3 max-w-prose">
                <p>
                  The Department of Computer Science & Engineering (Artificial Intelligence and Machine Learning) at G. Pulla Reddy Engineering College (Autonomous) was established to meet the soaring demand for specialized computational engineers.
                </p>
                <p>
                  With 8 state-of-the-art laboratories including the Intel Unnati Lab for AI Execution, our curriculum combines fundamental computer science rigor with advanced neural network modeling, natural language processing, and automated decision engines.
                </p>
              </div>
            </div>

            {/* Right 1-Col: Quick Stats Data Table Stack */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <span className="font-display text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                Department At A Glance
              </span>
              <div className="divide-y divide-[var(--color-border)]">
                <div className="py-3.5 flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-secondary)] font-medium">Total Student Intake</span>
                  <span className="font-mono text-xl font-bold text-[var(--color-accent)]">320+</span>
                </div>
                <div className="py-3.5 flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-secondary)] font-medium">Faculty Members</span>
                  <span className="font-mono text-xl font-bold text-[var(--color-accent)]">24</span>
                </div>
                <div className="py-3.5 flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-secondary)] font-medium">Specialized Labs</span>
                  <span className="font-mono text-xl font-bold text-[var(--color-accent)]">08</span>
                </div>
                <div className="py-3.5 flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-secondary)] font-medium">Autonomous Batches</span>
                  <span className="font-mono text-xl font-bold text-[var(--color-accent)]">04</span>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Faculty Grid */}
          <section className="flex flex-col gap-6 section-rhythm">
            <div className="flex flex-col gap-1">
              <span className="font-display text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                Academic Leadership
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                Department Faculty & Instructors
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {facultyLinks?.length > 0 ? (
                facultyLinks.map((fac) => (
                  <div
                    key={fac._id}
                    onClick={() => setSelectedFaculty(fac)}
                    className="glass-card p-5 flex flex-col gap-3 cursor-pointer hover:border-[var(--color-accent)] transition-all group"
                  >
                    {/* Square Avatar (Formal institutional style) */}
                    <div className="w-full aspect-square rounded-lg bg-[var(--color-bg-secondary)] overflow-hidden border border-[var(--color-border)] flex items-center justify-center">
                      {fac.imageUrl ? (
                        <ClickableImage
                          src={fac.imageUrl}
                          alt={fac.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-display font-black text-2xl text-[var(--color-accent)] bg-[var(--color-accent-subtle)]">
                          {fac.name.split('.').pop().trim().charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-accent)] transition-colors">
                        {fac.name}
                      </h3>
                      <p className="text-xs text-[var(--color-text-muted)] font-medium truncate mt-0.5">
                        {fac.designation || 'Faculty Member'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 glass-card text-xs text-[var(--color-text-muted)] italic">
                  Faculty list updating soon.
                </div>
              )}
            </div>
          </section>

          {/* 5. Labs Section */}
          <section className="flex flex-col gap-6 section-rhythm">
            <div className="flex flex-col gap-1">
              <span className="font-display text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                Infrastructure
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                Specialized AI & ML Laboratories
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {LABS_LIST.map((lab) => (
                <div key={lab.id} className="glass-card p-6 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)]">{lab.name}</h3>
                      <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent-border)] flex-shrink-0">
                        {lab.id}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{lab.desc}</p>
                  </div>

                  {/* Software & Spec Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[var(--color-border)]">
                    {lab.specs.map((spec) => (
                      <span key={spec} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                        ✓ {spec}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>

      {/* Faculty Modal */}
      {selectedFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg p-6 relative flex flex-col gap-4 animate-scale-in">
            <button
              onClick={() => setSelectedFaculty(null)}
              className="absolute top-4 right-4 text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              ✕ Close
            </button>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-[var(--color-border)] flex-shrink-0">
                {selectedFaculty.imageUrl ? (
                  <ClickableImage src={selectedFaculty.imageUrl} alt={selectedFaculty.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-display font-bold text-xl text-[var(--color-accent)] bg-[var(--color-accent-subtle)]">
                    {selectedFaculty.name.split('.').pop().trim().charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-[var(--color-text-primary)]">{selectedFaculty.name}</h3>
                <p className="text-xs text-[var(--color-accent)] font-medium mt-0.5">{selectedFaculty.designation || 'Faculty Member'}</p>
                {selectedFaculty.email && <p className="text-xs font-mono text-[var(--color-text-muted)] mt-1">{selectedFaculty.email}</p>}
              </div>
            </div>
            {selectedFaculty.profileUrl && (
              <a href={selectedFaculty.profileUrl} target="_blank" rel="noreferrer" className="btn-primary text-xs w-full mt-2">
                View Academic Profile ↗
              </a>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
