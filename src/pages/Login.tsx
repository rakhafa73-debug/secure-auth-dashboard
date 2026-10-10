import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Alert, Button, Checkbox, Input } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated';
import { loginSchema, type LoginValues } from '@/lib/validation';
import { toFriendlyMessage } from '@/lib/errors';
import { safeRedirectPath } from '@/lib/redirect';

export default function Login() {
  useDocumentTitle('Sign in');
  useRedirectIfAuthenticated();

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await signIn({
        email: values.email,
        password: values.password,
        remember: values.remember,
      });
      const params = new URLSearchParams(location.search);
      const target = safeRedirectPath(params.get('redirect'));
      // With an explicit (validated) target, go there. Otherwise defer to
      // useRedirectIfAuthenticated which routes by role (admin -> /admin).
      if (target) navigate(target, { replace: true });
    } catch (error) {
      // Generic message — never reveals whether the email exists.
      setFormError(toFriendlyMessage(error));
    }
  });

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-content sm:text-[28px]">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-content-muted">
          Sign in to continue to your secure workspace.
        </p>
      </div>

      {formError && (
        <div className="mb-5">
          <Alert tone="error" title="Sign-in failed">
            {formError}
          </Alert>
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
          {...register('email')}
        />

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-[13px] font-medium text-content">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-[13px] font-medium text-accent transition-colors hover:text-primary"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            label="Password"
            hideLabel
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        <Checkbox
          id="remember"
          label="Remember me for 30 days"
          {...register('remember')}
        />

        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-content-muted">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-accent hover:text-primary">
          Create one
        </Link>
      </p>

      <div className="mt-8 border-t border-line pt-5 text-center text-xs text-content-faint">
        By continuing you agree to our{' '}
        <Link to="/terms" className="link-muted">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to="/privacy" className="link-muted">
          Privacy Policy
        </Link>
        .
      </div>
    </AuthLayout>
  );
}
