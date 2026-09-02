import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthed, initializing } = useAuth();

  if (initializing) return null; // avoid flash-redirect while checking storage
  if (!isAuthed) return <Navigate to="/login" replace />;

  return children;
}
