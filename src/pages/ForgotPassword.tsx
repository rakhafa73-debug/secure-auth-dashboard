import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Alert, Button, Input } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/lib/validation';
import { toFriendlyMessage, GENERIC_RESET_MESSAGE } from '@/lib/errors';

export default function ForgotPassword() {
  useDocumentTitle('Reset password');
  const { requestPasswordReset } = useAuth();
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await requestPasswordReset(values.email);
      setSent(true);
    } catch (error) {
      // Even on failure we keep messaging generic to avoid email enumeration,
      // but surface a real problem so the user can retry.
      setFormError(toFriendlyMessage(error, GENERIC_RESET_MESSAGE));
    }
  });

  if (sent) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-success/30 bg-success-soft">
            <CheckCircle2 className="h-6 w-6 text-success" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-content">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-content-muted">
            {GENERIC_RESET_MESSAGE} The link expires shortly, so use it soon.
          </p>
          <p className="mt-4 rounded-xl border border-line bg-white/[0.02] px-4 py-3 text-sm text-content">
            {getValues('email')}
          </p>
          <Button
            variant="secondary"
            className="mt-6"
            fullWidth
            onClick={() => setSent(false)}
          >
            Use a different email
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Link
        to="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-content-muted transition-colors hover:text-content"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to sign in
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-content sm:text-[28px]">
          Forgot your password?
        </h1>
        <p className="mt-1.5 text-sm text-content-muted">
          Enter your email and we&apos;ll send you a secure link to reset it.
        </p>
      </div>

      {formError && (
        <div className="mb-5">
          <Alert tone="error">{formError}</Alert>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@company.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          autoFocus
          {...register('email')}
        />

        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-content-muted">
        Remembered it?{' '}
        <Link to="/login" className="font-semibold text-accent hover:text-primary">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
