import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Alert, Button } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';

/**
 * Shown when a previously valid session could not be refreshed. Offers a
 * one-click path back to sign-in without silently dumping the user.
 */
export function SessionExpiredBanner() {
  const { sessionExpired, clearSessionExpired, signOut } = useAuth();
  const navigate = useNavigate();

  if (!sessionExpired) return null;

  const handleSignIn = async () => {
    clearSessionExpired();
    try {
      await signOut();
    } catch {
      /* ignore */
    }
    navigate('/login', { replace: true });
  };

  return (
    <div className="mb-6">
      <Alert tone="warning" title="Your session expired">
        {`For your security, your session ended after a period of inactivity. Please sign in again to continue.`}
        <div className="mt-3">
          <Button size="sm" onClick={handleSignIn}>
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            Sign in again
          </Button>
        </div>
      </Alert>
    </div>
  );
}
