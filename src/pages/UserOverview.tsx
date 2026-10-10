import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  KeyRound,
  Mail,
  MailWarning,
  ShieldCheck,
  Sparkles,
  UserCog,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Alert, Avatar, Badge, Button, Card, CardBody, CardHeader } from '@/components/ui';
import { InfoRow, PageHeader } from '@/components/dashboard/PageHeader';
import { formatDate, formatRelative } from '@/lib/format';
import { cn } from '@/lib/cn';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function UserOverview() {
  useDocumentTitle('Overview');
  const { profile, user, role } = useAuth();

  const displayName = profile?.full_name ?? user?.email ?? 'there';
  const firstName = displayName.split(' ')[0];
  const isVerified = Boolean(user?.email_confirmed_at);

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${firstName}`}
        description="Here's a snapshot of your SecureAuth account."
      />

      <div className="grid gap-6">
        {/* Profile hero */}
        <Card className="overflow-hidden">
          <div className="bg-grid-fade px-5 py-6 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar name={profile?.full_name} email={profile?.email ?? user?.email} size="xl" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-lg font-semibold text-content">
                    {profile?.full_name ?? 'Unnamed account'}
                  </h3>
                  <Badge tone={role === 'admin' ? 'primary' : 'neutral'}>
                    {role === 'admin' ? 'Administrator' : 'Member'}
                  </Badge>
                </div>
                <p className="mt-1 truncate text-sm text-content-muted">
                  {profile?.email ?? user?.email}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge
                    tone={isVerified ? 'success' : 'warning'}
                    icon={
                      isVerified ? (
                        <BadgeCheck className="h-3.5 w-3.5" />
                      ) : (
                        <MailWarning className="h-3.5 w-3.5" />
                      )
                    }
                  >
                    {isVerified ? 'Email verified' : 'Email not verified'}
                  </Badge>
                  <Badge tone="success" icon={<span className="h-1.5 w-1.5 rounded-full bg-success" />}>
                    Account active
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {!isVerified && (
          <Alert tone="warning" title="Verify your email address">
            Check your inbox for the confirmation link. Verifying your email keeps your
            account secure and enables account recovery.
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Account details */}
          <Card>
            <CardHeader
              title="Account details"
              description="Information linked to your SecureAuth identity."
            />
            <CardBody className="pt-0">
              <dl className="divide-y divide-line">
                <InfoRow label="Email" icon={<Mail className="h-4 w-4" />}>
                  {profile?.email ?? user?.email}
                </InfoRow>
                <InfoRow label="Role" icon={<ShieldCheck className="h-4 w-4" />}>
                  <span className="capitalize">{role}</span>
                </InfoRow>
                <InfoRow label="Member since" icon={<CalendarDays className="h-4 w-4" />}>
                  {formatDate(profile?.created_at ?? user?.created_at)}
                </InfoRow>
              </dl>
            </CardBody>
          </Card>

          {/* Security summary */}
          <Card>
            <CardHeader
              title="Security summary"
              description="The current state of your account protection."
              action={<ShieldCheck className="h-5 w-5 text-success" aria-hidden="true" />}
            />
            <CardBody className="pt-0">
              <div className="space-y-3">
                <SecurityCheck label="Password authentication enabled" ok />
                <SecurityCheck label="Session encrypted in transit" ok />
                <SecurityCheck
                  label={isVerified ? 'Email address verified' : 'Email address not verified'}
                  ok={isVerified}
                />
                <SecurityCheck label="Multi-factor authentication" ok={false} pending />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to="/security">
                  <Button size="sm" variant="secondary">
                    <KeyRound className="h-4 w-4" aria-hidden="true" />
                    Change password
                  </Button>
                </Link>
                <Link to="/security">
                  <Button size="sm" variant="ghost">
                    Manage security
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Quick actions */}
        <Card>
          <CardHeader title="Quick actions" description="Jump to common tasks." />
          <CardBody className="pt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              <QuickAction
                to="/profile"
                icon={<UserCog className="h-5 w-5" />}
                title="Edit profile"
                description="Update your display name"
              />
              <QuickAction
                to="/security"
                icon={<Sparkles className="h-5 w-5" />}
                title="Review security"
                description="Password & sessions"
              />
            </div>
            <p className="mt-4 text-xs text-content-faint">
              Last sign-in: {formatRelative(user?.last_sign_in_at) === '—' ? 'Just now' : formatRelative(user?.last_sign_in_at)}
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function SecurityCheck({
  label,
  ok,
  pending,
}: {
  label: string;
  ok?: boolean;
  pending?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] px-3.5 py-3">
      <span
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-full',
          ok ? 'bg-success-soft text-success' : 'bg-amber-300/10 text-amber-200',
        )}
        aria-hidden="true"
      >
        {ok ? <BadgeCheck className="h-3.5 w-3.5" /> : <MailWarning className="h-3.5 w-3.5" />}
      </span>
      <span className="flex-1 text-sm text-content">{label}</span>
      {pending && <Badge tone="warning">Soon</Badge>}
    </div>
  );
}

function QuickAction({
  to,
  icon,
  title,
  description,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] p-4 transition-all hover:border-primary/40 hover:bg-primary/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white/[0.03] text-accent">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-content">{title}</span>
        <span className="block truncate text-xs text-content-muted">{description}</span>
      </span>
      <ArrowUpRight
        className="h-4 w-4 text-content-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}
