import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import DashboardSidebar from './DashboardSidebar';
import MobileBottomTabBar from './MobileBottomTabBar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors duration-220 flex flex-col">
      {/* Shared Navbar */}
      <Navbar />

      {/* Mobile Toggle Bar */}
      <div className="md:hidden h-12 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center px-4 justify-between sticky top-16 z-30">
        <button
          id="mobile-sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle Navigation Drawer"
          className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-xs font-mono font-bold text-[var(--color-text-muted)] tracking-wider uppercase">Menu Drawer</span>
      </div>

      <div className="flex-1 flex pt-0">
        {/* Sidebar */}
        <DashboardSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Content Outlet */}
        <main className="flex-1 md:pl-18 lg:pl-64 pb-16 md:pb-0 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (<768px) */}
      <MobileBottomTabBar />
    </div>
  );
}
