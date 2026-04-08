import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OnboardingRoute({ children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.onboarded) return <Navigate to="/" replace />;

  return children;
}