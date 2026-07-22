import { NavLink } from 'react-router-dom';

const MOBILE_TABS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/dashboard/skill-roadmap', label: 'Roadmap', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { path: '/dashboard/connect-sphere', label: 'Chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { path: '/dashboard/resume-guide', label: 'Resumes', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { path: '/dashboard/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

export default function MobileBottomTabBar() {
  return (
    <nav
      id="mobile-bottom-tab-bar"
      className="md:hidden fixed bottom-0 inset-x-0 h-16 z-40 bg-[var(--color-surface)] border-t border-[var(--color-border)] flex items-center justify-around px-2 backdrop-blur-md"
    >
      {MOBILE_TABS.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          end={tab.path === '/dashboard'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 flex-1 h-full text-[10px] font-semibold transition-colors ${
              isActive
                ? 'text-[var(--color-accent)] font-bold'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <svg
                className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.2 : 1.8} d={tab.icon} />
              </svg>
              <span>{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
