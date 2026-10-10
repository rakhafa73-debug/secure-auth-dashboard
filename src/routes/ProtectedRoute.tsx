import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { FullPageLoader } from '@/components/ui';

/**
 * Gate for authenticated-only areas. This is a UX guard only — the real
 * authorisation boundary is Supabase Row Level Security on the server.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <FullPageLoader label="Securing your session" />;
  }

  if (!isAuthenticated) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  return <Outlet />;
}
