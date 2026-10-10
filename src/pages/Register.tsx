import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, User } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Alert, Button, Checkbox, Input, PasswordStrength } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated';
import { registerSchema, type RegisterValues } from '@/lib/validation';
import { toFriendlyMessage, GENERIC_REGISTER_MESSAGE } from '@/lib/errors';

export default function Register() {
  useDocumentTitle('Create account');
  useRedirectIfAuthenticated();

  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false as unknown as true,
    },
  });

  const passwordValue = watch('password') ?? '';

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const { needsEmailConfirmation } = await signUp({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
      });

      if (needsEmailConfirmation) {
        setSuccess(true);
        return;
      }
      // Email confirmation disabled: user is signed in immediately.
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setFormError(toFriendlyMessage(error, GENERIC_REGISTER_MESSAGE));
    }
  });

  if (success) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-success/30 bg-success-soft">
            <Mail className="h-6 w-6 text-success" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-content">
            Check your inbox
          </h1>
          <p className="mt-2 text-sm text-content-muted">
            We&apos;ve sent a confirmation link to your email address. Click the link to
            verify your account and finish setting up SecureAuth.
          </p>
          <div className="mt-6">
            <Alert tone="info">
              Didn&apos;t get the email? Check your spam folder, or try signing in
              again to resend confirmation.
            </Alert>
          </div>
          <Button
            variant="secondary"
            className="mt-6"
            fullWidth
            onClick={() => navigate('/login', { replace: true })}
          >
            Back to sign in
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-content sm:text-[28px]">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-content-muted">
          Start protecting your workspace in under a minute.
        </p>
      </div>

      {formError && (
        <div className="mb-5">
          <Alert tone="error" title="Could not create account">
            {formError}
          </Alert>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <Input
          label="Full name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@company.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordStrength value={passwordValue} />
        </div>

        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Checkbox
          id="acceptTerms"
          label={
            <>
              I agree to the{' '}
              <Link to="/terms" className="text-accent hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-accent hover:underline">
                Privacy Policy
              </Link>
              .
            </>
          }
          error={errors.acceptTerms?.message}
          {...register('acceptTerms')}
        />

        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-content-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-accent hover:text-primary">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
