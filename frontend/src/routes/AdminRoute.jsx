import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

/**
 * AdminRoute — routes guard that restricts access to administrators.
 * Redirects students to /dashboard and anonymous users to /login.
 */
export default function AdminRoute({ children }) {
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      alert('Access Denied. You do not have permission to access the administrator panel.');
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
