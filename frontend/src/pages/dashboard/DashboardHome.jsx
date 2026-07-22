import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProgressRing from '../../components/shared/ProgressRing';
import SearchStudents from '../../components/shared/SearchStudents';
import ClickableImage from '../../components/shared/ClickableImage';

const BENTO_FEATURE_MODULES = [
  { id: 'dsa', name: 'Programming & DSA', isBento: true, icon: '💻', desc: '41 Topic Roadmaps, concept reference links, LeetCode & GeeksForGeeks practice problems.', path: '/dashboard/programming-dsa', tag: 'Placement Prep' },
  { id: 'roadmap', name: 'Skill Roadmap', isBento: true, icon: '🗺️', desc: 'Semester-wise skill progression, academic milestones, and target goals tracking.', path: '/dashboard/skill-roadmap', tag: 'High Priority' },
  { id: 'resumes', name: 'Resume Guide', isBento: true, icon: '📄', desc: 'Build ATS-compliant resumes with department templates and AI section guides.', path: '/dashboard/resume-guide', tag: 'High Priority' },
  { id: 'chat', name: 'Connect Sphere', isBento: true, icon: '💬', desc: 'Real-time department chat space for peer collaboration and study groups.', path: '/dashboard/connect-sphere', tag: 'Live Chat' },
  { id: 'announcements', name: 'Announcements', isBento: false, icon: '🔔', desc: 'Department notices, placement news, and academic schedules.', path: '/dashboard/announcements', tag: 'Live' },
  { id: 'certifications', name: 'Certifications', isBento: false, icon: '🏅', desc: 'Recommended industry certifications (NPTEL, Coursera, AWS).', path: '/dashboard/certifications', tag: 'Live' },
  { id: 'achievements', name: 'Achievements', isBento: false, icon: '🌟', desc: 'Student spotlights, hackathon wins, and department awards.', path: '/dashboard/achievements', tag: 'Live' },
  { id: 'companies', name: 'Companies', isBento: false, icon: '🏢', desc: 'Placement drives, hiring criteria, and company statistics.', path: '/dashboard/companies', tag: 'Live' },
  { id: 'alumni', name: 'Alumni Repository', isBento: false, icon: '🎓', desc: 'Interview experiences, prep tips, and Q&A from placed seniors.', path: '/dashboard/alumni-repos', tag: 'Live' },
  { id: 'resources', name: 'Learning Resources', isBento: false, icon: '📚', desc: 'Curated study materials, lab guides, and video references.', path: '/dashboard/learning-resources', tag: 'Live' },
  { id: 'events', name: 'Department Events', isBento: false, icon: '📅', desc: 'Upcoming hackathons, coding contests, and guest lectures.', path: null, tag: 'Coming Soon' },
];

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/dashboard/profile');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-8 animate-fade-in font-sans">
      
      {/* 1. Greeting Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-[var(--color-border)] pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
            {getGreeting()}, {user?.name.split(' ')[0]}!
          </h1>
          <p className="font-mono text-xs text-[var(--color-text-muted)] mt-1 flex items-center gap-2">
            <span>📅 {formattedDate}</span>
            <span>·</span>
            <span>CSM Department · GPREC</span>
          </p>
        </div>

        <div className="w-full md:w-auto flex items-center gap-3">
          <div className="w-full md:w-64">
            <SearchStudents />
          </div>
          <button
            onClick={() => navigate('/dashboard/skill-roadmap')}
            className="btn-primary text-xs flex-shrink-0 hidden sm:inline-flex"
          >
            View Roadmap →
          </button>
        </div>
      </div>

      {/* 2. Profile Overview Card */}
      <div
        id="profile-overview-card"
        onClick={handleProfileClick}
        className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6 cursor-pointer hover:border-[var(--color-accent)] transition-all group"
      >
        {/* User profile photo */}
        <div className="w-20 h-20 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] overflow-hidden flex-shrink-0 flex items-center justify-center">
          {user?.profileImage ? (
            <ClickableImage src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-2xl font-bold text-[var(--color-accent)]">
              {user?.name?.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        {/* Identity Details */}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
            {user?.name}
          </h2>
          <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5">
            {user?.rollNo}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent-border)]">
              BRANCH: {user?.branch || 'CSM'}
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
              YEAR: {user?.year || 'N/A'}
            </span>
          </div>
        </div>

        {/* Animated Progress Ring */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <ProgressRing percent={user?.progress?.completionPercent || 0} size={88} strokeWidth={6} />
          <span className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase">Profile Score</span>
        </div>
      </div>

      {/* 3. Feature Modules Grid (Asymmetric Bento Arrangement) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
            Department Portal Modules
          </h3>
          <span className="text-[10px] font-mono text-[var(--color-accent)]">10 Modules Available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {BENTO_FEATURE_MODULES.map((tile) => {
            const isLive = !!tile.path;
            return (
              <div
                key={tile.id}
                onClick={() => isLive && navigate(tile.path)}
                className={`glass-card p-6 flex flex-col justify-between gap-4 transition-all duration-150 group ${
                  tile.isBento ? 'md:col-span-2 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-raised)]' : ''
                } ${
                  isLive
                    ? 'cursor-pointer hover:-translate-y-0.5 hover:border-[var(--color-accent)]'
                    : 'opacity-70 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {/* Small Icon Container */}
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] flex items-center justify-center text-xl flex-shrink-0">
                      {tile.icon}
                    </div>
                    <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                      isLive
                        ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border-[var(--color-accent-border)]'
                        : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] border-[var(--color-border)]'
                    }`}>
                      {tile.tag}
                    </span>
                  </div>

                  <h4 className="font-display text-base font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                    {tile.name}
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mt-1">
                    {tile.desc}
                  </p>
                </div>

                {isLive && (
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[var(--color-accent)] pt-2 border-t border-[var(--color-border)]">
                    <span>Access Module</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
