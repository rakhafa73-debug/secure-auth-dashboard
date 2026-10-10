import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  KeyRound,
  Laptop,
  LogOut,
  Mail,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
} from '@/components/ui';
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog';
import { InfoRow, PageHeader } from '@/components/dashboard/PageHeader';
import { formatDateTime, formatRelative } from '@/lib/format';
import { toFriendlyMessage } from '@/lib/errors';

export default function SecuritySettings() {
  useDocumentTitle('Security');
  const { user, profile, requestPasswordReset, signOut } = useAuth();
  const navigate = useNavigate();

  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const email = profile?.email ?? user?.email ?? '';

  const handlePasswordReset = async () => {
    if (!email) return;
    setResetStatus('sending');
    setResetMessage(null);
    try {
      await requestPasswordReset(email);
      setResetStatus('sent');
      setResetMessage(
        'If your account is eligible, a password reset link has been sent to your email.',
      );
    } catch (error) {
      setResetStatus('error');
      setResetMessage(
        toFriendlyMessage(error, 'We could not start the password reset. Please try again.'),
      );
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
      setConfirmLogout(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Security settings"
        description="Review how your account is protected and manage active access."
      />

      <div className="grid gap-6">
        {/* Authentication methods */}
        <Card>
          <CardHeader
            title="Authentication"
            description="How you prove your identity when signing in."
            action={<ShieldCheck className="h-5 w-5 text-success" aria-hidden="true" />}
          />
          <CardBody className="pt-0">
            <div className="space-y-3">
              <MethodRow
                icon={<Mail className="h-4 w-4" />}
                title="Email & password"
                description={email || 'Not available'}
                badge={<Badge tone="success">Active</Badge>}
              />
              <MethodRow
                icon={<KeyRound className="h-4 w-4" />}
                title="Password"
                description="Managed securely by Supabase Auth — never stored by this app."
                action={
                  <Button
                    size="sm"
                    variant="secondary"
                    isLoading={resetStatus === 'sending'}
                    onClick={handlePasswordReset}
                  >
                    Send reset link
                  </Button>
                }
              />
              <MethodRow
                icon={<Smartphone className="h-4 w-4" />}
                title="Multi-factor authentication"
                description="Add a second factor to protect your account."
                badge={<Badge tone="warning">Coming soon</Badge>}
              />
            </div>

            {resetMessage && (
              <div className="mt-4">
                <Alert tone={resetStatus === 'error' ? 'error' : 'success'}>
                  {resetMessage}
                </Alert>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Active session */}
        <Card>
          <CardHeader
            title="Active session"
            description="Details about your current signed-in session."
            action={<Laptop className="h-5 w-5 text-accent" aria-hidden="true" />}
          />
          <CardBody className="pt-0">
            <dl className="divide-y divide-line">
              <InfoRow label="Session status" icon={<Clock className="h-4 w-4" />}>
                <span className="inline-flex items-center gap-1.5 text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                  Active
                </span>
              </InfoRow>
              <InfoRow label="Last sign-in" icon={<Clock className="h-4 w-4" />}>
                {formatRelative(user?.last_sign_in_at)}
              </InfoRow>
              <InfoRow label="Last updated" icon={<Clock className="h-4 w-4" />}>
                {formatDateTime(user?.updated_at)}
              </InfoRow>
            </dl>

            <div className="mt-5 rounded-xl border border-line bg-white/[0.02] p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white/[0.03] text-accent">
                  <Laptop className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-content">This device</p>
                  <p className="text-xs text-content-muted">
                    Current browser session · {navigator.userAgent.includes('Mobi') ? 'Mobile' : 'Desktop'}
                  </p>
                </div>
                <Badge tone="success">Current</Badge>
              </div>
            </div>

            <div className="mt-5">
              <Button variant="danger" onClick={() => setConfirmLogout(true)}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out of this device
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Upcoming protections */}
        <Card>
          <CardHeader
            title="Planned protections"
            description="Features on the SecureAuth security roadmap."
            action={<Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />}
          />
          <CardBody className="pt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              <RoadmapItem title="TOTP authenticator" description="Time-based one-time codes" />
              <RoadmapItem title="Security keys" description="WebAuthn / passkeys" />
              <RoadmapItem title="Session list" description="Review and revoke devices" />
              <RoadmapItem title="Login alerts" description="Email notifications on new sign-ins" />
            </div>
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="Sign out?"
        description="You will need to enter your credentials again to access your workspace."
        confirmLabel="Sign out"
        tone="danger"
        isLoading={loggingOut}
        onConfirm={handleLogout}
        onClose={() => setConfirmLogout(false)}
      />
    </div>
  );
}

function MethodRow({
  icon,
  title,
  description,
  badge,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-white/[0.03] text-accent">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-content">{title}</p>
        <p className="truncate text-xs text-content-muted">{description}</p>
      </div>
      {badge}
      {action}
    </div>
  );
}

function RoadmapItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line px-4 py-3">
      <p className="flex items-center gap-2 text-sm font-medium text-content">
        {title}
        <Badge tone="warning">Soon</Badge>
      </p>
      <p className="mt-0.5 text-xs text-content-muted">{description}</p>
    </div>
  );
}
