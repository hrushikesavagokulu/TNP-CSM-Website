import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProgressRing from '../../components/shared/ProgressRing';
import SearchStudents from '../../components/shared/SearchStudents';

const TILES = [
  { name: 'Announcements', count: 'Coming Soon', icon: '🔔', desc: 'Department notices, placement news and notifications' },
  { name: 'Events & Coding Contests', count: 'Coming Soon', icon: '📅', desc: 'Register for upcoming events and hackathons' },
  { name: 'Skill Roadmap', count: 'Coming Soon', icon: '🗺️', desc: 'Verify roadmap goals and check academic progress' },
  { name: 'Certifications', count: 'Coming Soon', icon: '🏅', desc: 'Upload NPTEL, Coursera and technical certs' },
  { name: 'Company Profiles', count: 'Coming Soon', icon: '🏢', desc: 'Browse recruiting partners and job descriptions' },
  { name: 'Alumni Repository', count: 'Coming Soon', icon: '🎓', desc: 'Browse interview experiences and projects' },
  { name: 'Achievements Directory', count: 'Coming Soon', icon: '✨', desc: 'View student achievements and academic awards' },
  { name: 'Learning Resources', count: 'Coming Soon', icon: '📚', desc: 'Curated study materials, lab guides and notes' },
  { name: 'Resume Guide', count: 'Coming Soon', icon: '📄', desc: 'Build and format professional resumes' },
  { name: 'Connect Sphere', count: 'Coming Soon', icon: '💬', desc: 'Chat and coordinate with fellow classmates' },
];

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/dashboard/profile');
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      
      {/* Welcome & Search Bar Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[var(--color-border)] pb-6">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Welcome, {user?.name.split(' ')[0]}!</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">CSM Department Web Portal · GPREC</p>
        </div>
        <div className="w-full md:w-auto flex-1 md:max-w-md">
          <SearchStudents />
        </div>
      </div>

      {/* Main Stats Card */}
      <div
        id="profile-overview-card"
        onClick={handleProfileClick}
        className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6 cursor-pointer hover:shadow-lg hover:border-[var(--color-accent)] transition-all duration-200"
      >
        {/* User profile photo */}
        <div className="w-20 h-20 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] overflow-hidden flex-shrink-0 flex items-center justify-center">
          {user?.profileImage ? (
            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-[var(--color-text-muted)]">
              {user?.name?.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        {/* Identity Details */}
        <div className="flex-1 text-center sm:text-left gap-1">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{user?.name}</h2>
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-mono mt-0.5">{user?.rollNo}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent-border)]">
              {user?.branch || 'CSM'}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
              Year {user?.year || 'N/A'}
            </span>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="flex-shrink-0">
          <ProgressRing percent={user?.progress?.completionPercent || 0} size={96} strokeWidth={6} />
        </div>
      </div>

      {/* Grid of Other Platform Modules (Stubs) */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Department Portal Modules</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TILES.map((tile) => (
            <div
              key={tile.name}
              className="glass-card p-6 flex flex-col gap-2 relative overflow-hidden opacity-85 hover:opacity-100 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group"
            >
              {/* Coming soon ribbon */}
              <div className="absolute top-3 right-3 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-[var(--color-border)] text-[var(--color-text-muted)] group-hover:bg-[var(--color-accent-subtle)] group-hover:text-[var(--color-accent)] transition-colors">
                {tile.count}
              </div>

              {/* Icon */}
              <div className="text-3xl select-none mb-1">{tile.icon}</div>

              {/* Name & description */}
              <h4 className="text-sm font-bold text-[var(--color-text-primary)]">{tile.name}</h4>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{tile.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
