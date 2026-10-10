import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button, FullPageLoader } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/**
 * Landing page for email confirmation / magic-link redirects.
 * supabase-js (detectSessionInUrl) exchanges the PKCE code automatically; here
 * we simply wait for the session to resolve and route the user appropriately.
 */
export default function AuthCallback() {
  useDocumentTitle('Verifying');
  const { user, isInitializing } = useAuth();
  const navigate = useNavigate();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isInitializing) return;
    const timer = window.setTimeout(() => setTimedOut(true), 8000);
    return () => window.clearTimeout(timer);
  }, [isInitializing]);

  useEffect(() => {
    if (isInitializing) return;
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [isInitializing, user, navigate]);

  if (isInitializing && !timedOut) {
    return <FullPageLoader label="Confirming your email" />;
  }

  if (user) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-success/30 bg-success-soft">
            <CheckCircle2 className="h-6 w-6 text-success" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-content">
            Email confirmed
          </h1>
          <p className="mt-2 text-sm text-content-muted">
            Your account is verified. Taking you to your dashboard…
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-danger/30 bg-danger-soft">
          <ShieldAlert className="h-6 w-6 text-danger" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-content">
          Could not verify link
        </h1>
        <p className="mt-2 text-sm text-content-muted">
          This confirmation link is invalid or has expired. Please sign in to request a
          new one.
        </p>
        <div className="mt-6 space-y-3">
          <Button fullWidth onClick={() => navigate('/login', { replace: true })}>
            Go to sign in
          </Button>
          <Link to="/register" className="block text-sm link-muted">
            Create a new account
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
