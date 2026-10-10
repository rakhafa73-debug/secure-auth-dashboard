import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, CheckCircle2, Fingerprint, Mail, User } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Alert, Avatar, Badge, Button, Card, CardBody, CardHeader, Input } from '@/components/ui';
import { InfoRow, PageHeader } from '@/components/dashboard/PageHeader';
import { updateProfileSchema, type UpdateProfileValues } from '@/lib/validation';
import { formatDate } from '@/lib/format';
import { toFriendlyMessage } from '@/lib/errors';

export default function Profile() {
  useDocumentTitle('My profile');
  const { profile, user, role, updateProfile, refreshProfile } = useAuth();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { fullName: profile?.full_name ?? '' },
  });

  // Keep the form in sync if the profile is (re)loaded.
  useEffect(() => {
    reset({ fullName: profile?.full_name ?? '' });
  }, [profile?.full_name, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setStatus('idle');
    setErrorMessage(null);
    try {
      await updateProfile({ fullName: values.fullName });
      setStatus('success');
      window.setTimeout(() => setStatus('idle'), 4000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(toFriendlyMessage(error, 'We could not save your changes. Please try again.'));
    }
  });

  const created = profile?.created_at ?? user?.created_at;

  return (
    <div>
      <PageHeader
        title="My profile"
        description="Manage your personal information and account identity."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Identity card */}
        <Card className="lg:col-span-1">
          <CardBody className="flex flex-col items-center py-8 text-center">
            <Avatar name={profile?.full_name} email={profile?.email ?? user?.email} size="xl" />
            <h3 className="mt-4 max-w-full truncate text-lg font-semibold text-content">
              {profile?.full_name ?? 'Unnamed account'}
            </h3>
            <p className="mt-0.5 max-w-full truncate text-sm text-content-muted">
              {profile?.email ?? user?.email}
            </p>
            <div className="mt-3">
              <Badge tone={role === 'admin' ? 'primary' : 'neutral'}>
                {role === 'admin' ? 'Administrator' : 'Member'}
              </Badge>
            </div>

            <dl className="mt-6 w-full divide-y divide-line text-left">
              <InfoRow label="User ID" icon={<Fingerprint className="h-4 w-4" />}>
                <span className="font-mono text-xs" title={user?.id}>
                  {user?.id ? `${user.id.slice(0, 8)}…` : '—'}
                </span>
              </InfoRow>
              <InfoRow label="Joined" icon={<CalendarDays className="h-4 w-4" />}>
                {formatDate(created)}
              </InfoRow>
            </dl>

            <Button
              variant="ghost"
              size="sm"
              className="mt-4"
              onClick={() => void refreshProfile()}
            >
              Refresh data
            </Button>
          </CardBody>
        </Card>

        {/* Edit form */}
        <div className="space-y-6 lg:col-span-2">
          {status === 'success' && (
            <Alert tone="success" title="Profile updated">
              Your changes have been saved successfully.
            </Alert>
          )}
          {status === 'error' && errorMessage && (
            <Alert tone="error" title="Could not save">
              {errorMessage}
            </Alert>
          )}

          <Card>
            <CardHeader
              title="Personal information"
              description="Update the details shown across your workspace."
            />
            <CardBody className="pt-0">
              <form onSubmit={onSubmit} noValidate className="space-y-5">
                <Input
                  label="Full name"
                  autoComplete="name"
                  leftIcon={<User className="h-4 w-4" />}
                  error={errors.fullName?.message}
                  {...register('fullName')}
                />

                <Input
                  label="Email address"
                  value={profile?.email ?? user?.email ?? ''}
                  leftIcon={<Mail className="h-4 w-4" />}
                  readOnly
                  disabled
                  hint="Email changes are managed through your authentication provider."
                />

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => reset({ fullName: profile?.full_name ?? '' })}
                    disabled={!isDirty || isSubmitting}
                  >
                    Discard
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={!isDirty}
                  >
                    {status === 'success' ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Saved
                      </>
                    ) : (
                      'Save changes'
                    )}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
