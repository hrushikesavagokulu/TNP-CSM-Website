import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/dashboard/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { path: '/dashboard/announcements', label: 'Announcements', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { path: '/dashboard/events', label: 'Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { path: '/dashboard/roadmap', label: 'Semester Skill Roadmap', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { path: '/dashboard/certifications', label: 'Semester Certs & Achievements', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  { path: '/dashboard/companies', label: 'Companies', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { path: '/dashboard/alumni', label: 'Alumni Repos', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { path: '/dashboard/learning', label: 'Resources', icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
  { path: '/dashboard/resume', label: 'Resume Guide', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { path: '/dashboard/chat', label: 'Connect Sphere', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
];

export default function DashboardSidebar({ isOpen, setIsOpen }) {
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          id="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        id="dashboard-sidebar"
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-[var(--color-border)]
          transition-transform duration-300 ease-in-out lg:translate-x-0
          bg-[var(--color-surface)] flex flex-col justify-between
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
          <ul className="space-y-1 list-none p-0 m-0">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/dashboard'}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium no-underline
                    transition-all duration-150 group
                    ${isActive
                      ? 'bg-[var(--color-accent)] text-white shadow-sm'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-accent-subtle)]'}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <svg
                        className={`w-5 h-5 flex-shrink-0 transition-colors duration-150 ${
                          isActive ? 'text-white' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)]'
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]/30 text-center">
          <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)]">
            CSM Department Web Portal
          </p>
        </div>
      </aside>
    </>
  );
}
