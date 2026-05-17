import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_HOME } from '@/lib/constants';

export function RootRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth/login" replace />;
  return <Navigate to={ROLE_HOME[user.role] || '/auth/login'} replace />;
}
