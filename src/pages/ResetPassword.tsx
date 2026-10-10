import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, KeyRound, ShieldAlert } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Alert, Button, FullPageLoader, Input, PasswordStrength } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { resetPasswordSchema, type ResetPasswordValues } from '@/lib/validation';
import { toFriendlyMessage } from '@/lib/errors';

/** Reads error params Supabase may append to the recovery redirect URL. */
function readRecoveryError(): string | null {
  if (typeof window === 'undefined') return null;
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const queryParams = new URLSearchParams(window.location.search);
  const description =
    hashParams.get('error_description') ??
    queryParams.get('error_description') ??
    hashParams.get('error') ??
    queryParams.get('error');
  return description ? decodeURIComponent(description.replace(/\+/g, ' ')) : null;
}

export default function ResetPassword() {
  useDocumentTitle('Set new password');
  const { user, isInitializing, updatePassword, signOut } = useAuth();
  const navigate = useNavigate();

  const [recoveryError] = useState<string | null>(() => readRecoveryError());
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const passwordValue = watch('password') ?? '';

  // If the link is used without a valid recovery session, or the session
  // cannot be established, we never expose the form.
  const hasRecoverySession = Boolean(user);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await updatePassword(values.password);
      setDone(true);
    } catch (error) {
      setFormError(toFriendlyMessage(error, 'We could not update your password. Please try again.'));
    }
  });

  const handleContinue = async () => {
    // End the recovery session so the user signs in fresh with the new password.
    try {
      await signOut();
    } catch {
      /* ignore */
    }
    navigate('/login', { replace: true });
  };

  if (isInitializing) {
    return <FullPageLoader label="Verifying your reset link" />;
  }

  if (recoveryError || !hasRecoverySession) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-danger/30 bg-danger-soft">
            <ShieldAlert className="h-6 w-6 text-danger" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-content">
            Link invalid or expired
          </h1>
          <p className="mt-2 text-sm text-content-muted">
            {recoveryError ??
              'This password reset link is no longer valid. Request a new one to continue.'}
          </p>
          <div className="mt-6 space-y-3">
            <Button fullWidth onClick={() => navigate('/forgot-password', { replace: true })}>
              Request a new link
            </Button>
            <Button variant="ghost" fullWidth onClick={() => navigate('/login', { replace: true })}>
              Back to sign in
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-success/30 bg-success-soft">
            <CheckCircle2 className="h-6 w-6 text-success" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-content">
            Password updated
          </h1>
          <p className="mt-2 text-sm text-content-muted">
            Your password has been changed. Sign in again with your new credentials to
            keep your session secure.
          </p>
          <Button className="mt-6" fullWidth onClick={handleContinue}>
            Continue to sign in
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/12">
          <KeyRound className="h-5 w-5 text-accent" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-content sm:text-[28px]">
          Set a new password
        </h1>
        <p className="mt-1.5 text-sm text-content-muted">
          Choose a strong password you haven&apos;t used before.
        </p>
      </div>

      {formError && (
        <div className="mb-5">
          <Alert tone="error">{formError}</Alert>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div>
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            autoFocus
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordStrength value={passwordValue} />
        </div>

        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
          Update password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-content-muted">
        <Link to="/login" className="link-muted">
          Cancel and return to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
