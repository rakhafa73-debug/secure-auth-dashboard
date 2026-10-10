import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { FullPageLoader } from '@/components/ui';

/**
 * Gate for administrator-only areas.
 *
 * The client check improves UX (no flashing admin chrome for regular users),
 * but the actual enforcement lives in Postgres: every admin RPC re-verifies
 * `is_admin()` server-side. Hiding the menu is never the security boundary.
 */
export function AdminRoute() {
  const { isAuthenticated, isAdmin, isInitializing, isProfileLoading, profile } = useAuth();
  const location = useLocation();

  // Wait for both the session and the profile role to resolve.
  if (isInitializing || (isAuthenticated && isProfileLoading && !profile)) {
    return <FullPageLoader label="Checking permissions" />;
  }

  if (!isAuthenticated) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard?denied=admin" replace />;
  }

  return <Outlet />;
}
