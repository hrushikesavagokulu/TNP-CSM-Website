import { Routes, Route, Outlet } from 'react-router-dom';

import { ThemeProvider }  from './context/ThemeContext';
import { AuthProvider }   from './context/AuthContext';
import Navbar            from './components/layout/Navbar';
import PublicRoute       from './routes/PublicRoute';
import PrivateRoute      from './routes/PrivateRoute';
import AdminRoute        from './routes/AdminRoute';
import DashboardLayout   from './components/layout/DashboardLayout';
import AdminLayout       from './components/layout/AdminLayout';

// ── Pages ─────────────────────────────────────────────────────────────────────
import Register      from './pages/public/Register';
import Login         from './pages/public/Login';
import ForgotPassword from './pages/public/ForgotPassword';
import AdminLogin    from './pages/public/AdminLogin';
import Home          from './pages/public/Home';
import DashboardHome from './pages/dashboard/DashboardHome';
import Profile       from './pages/dashboard/Profile';
import StudentAnnouncements from './pages/dashboard/StudentAnnouncements';

// Admin Pages
import AdminHome     from './pages/admin/AdminHome';
import ManageStudents from './pages/admin/ManageStudents';
import ManageAdmins   from './pages/admin/ManageAdmins';
import ManageDepartmentInfo from './pages/admin/ManageDepartmentInfo';
import ManageBatches       from './pages/admin/ManageBatches';
import ManageAnnouncements from './pages/admin/ManageAnnouncements';
import ManageAchievements  from './pages/admin/ManageAchievements';

// ── Shared Public Layout (displays main Navbar) ──────────────────────────────
function PublicLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors duration-250">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

// ── App root ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public Routes with Navbar */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
          </Route>

          {/* Protected Dashboard Routes (with DashboardLayout + Sidebar) */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:rollNo" element={<Profile />} />
            <Route path="announcements" element={<StudentAnnouncements />} />
            
            {/* Catch-all stubs for features not yet built */}
            <Route path="*" element={
              <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
                <div className="text-center glass-card p-10">
                  <p className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Module Offline</p>
                  <p className="text-[var(--color-text-muted)] text-sm">This section will be activated in a subsequent phase.</p>
                </div>
              </div>
            } />
          </Route>

          {/* Protected Admin Routes (with AdminLayout + Sidebar) */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminHome />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="admins" element={<ManageAdmins />} />
            <Route path="department-info" element={<ManageDepartmentInfo />} />
            <Route path="batches" element={<ManageBatches />} />
            <Route path="announcements" element={<ManageAnnouncements />} />
            <Route path="certifications" element={<ManageAchievements />} />
            <Route path="achievements" element={<ManageAchievements />} />

            {/* Catch-all stubs for future admin features */}
            <Route path="*" element={
              <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
                <div className="text-center glass-card p-10">
                  <p className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Admin Module Offline</p>
                  <p className="text-[var(--color-text-muted)] text-sm">This administrative section will be activated in a subsequent phase.</p>
                </div>
              </div>
            } />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={
            <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
              <div className="text-center">
                <p className="text-6xl font-black text-[var(--color-text-muted)] mb-4">404</p>
                <p className="text-[var(--color-text-secondary)]">Page not found</p>
              </div>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
