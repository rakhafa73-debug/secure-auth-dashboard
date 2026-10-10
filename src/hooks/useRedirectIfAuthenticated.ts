import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { safeRedirectPath } from '@/lib/redirect';

/**
 * Redirects already-authenticated users away from public auth pages
 * (login/register/forgot) to their dashboard or an explicit `?redirect=` target.
 */
export function useRedirectIfAuthenticated(): void {
  const { isAuthenticated, isAdmin, isInitializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isInitializing || !isAuthenticated) return;
    const params = new URLSearchParams(location.search);
    const target = safeRedirectPath(params.get('redirect'));
    navigate(target ?? (isAdmin ? '/admin' : '/dashboard'), { replace: true });
  }, [isAuthenticated, isAdmin, isInitializing, location.search, navigate]);
}
