import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute — redirects unauthenticated users to /login.
 */
export default function PrivateRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
