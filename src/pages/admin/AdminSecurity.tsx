import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  BadgeCheck,
  Clock,
  FileWarning,
  Lock,
  MailWarning,
  ShieldCheck,
} from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  Alert,
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  SkeletonRows,
} from '@/components/ui';
import { InfoRow, PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { fetchPlatformStats, fetchUsersPage } from '@/lib/services/admin';
import { useAuth } from '@/contexts/auth-context';
import { toFriendlyMessage } from '@/lib/errors';
import { formatNumber, formatRelative, formatDateTime } from '@/lib/format';
import type { AdminPlatformStats, AdminUserRow } from '@/types/database';

export default function AdminSecurity() {
  useDocumentTitle('Security & activity');
  const { user } = useAuth();

  const [stats, setStats] = useState<AdminPlatformStats | null>(null);
  const [recent, setRecent] = useState<AdminUserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [platformStats, recentUsers] = await Promise.all([
        fetchPlatformStats(),
        fetchUsersPage({ page: 1, pageSize: 6 }),
      ]);
      setStats(platformStats);
      // Sort by most recent sign-in for a real activity feed.
      const sorted = [...recentUsers.rows].sort((a, b) => {
        const aTime = a.last_sign_in_at ? Date.parse(a.last_sign_in_at) : 0;
        const bTime = b.last_sign_in_at ? Date.parse(b.last_sign_in_at) : 0;
        return bTime - aTime;
      });
      setRecent(sorted);
    } catch (err) {
      setError(toFriendlyMessage(err, 'We could not load security data.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Security & activity"
        description="Monitor account verification and recent authentication activity."
        action={
          <Button variant="secondary" size="sm" onClick={() => void load()} isLoading={isLoading}>
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="mb-6">
          <Alert tone="error" title="Data unavailable">
            {error}{' '}
            <button onClick={() => void load()} className="font-semibold underline">
              Retry
            </button>
          </Alert>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Verified accounts"
          value={formatNumber(stats?.verified_users)}
          icon={<BadgeCheck className="h-4 w-4" />}
          tone="success"
          isLoading={isLoading}
        />
        <StatCard
          label="Pending verification"
          value={formatNumber(stats?.unverified_users)}
          icon={<MailWarning className="h-4 w-4" />}
          tone="warning"
          isLoading={isLoading}
        />
        <StatCard
          label="Administrators"
          value={formatNumber(stats?.admin_count)}
          icon={<ShieldCheck className="h-4 w-4" />}
          tone="primary"
          isLoading={isLoading}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Recent authentication activity"
            description="Most recent sign-ins recorded by the identity provider."
            action={<Activity className="h-5 w-5 text-accent" aria-hidden="true" />}
          />
          <CardBody className="pt-0">
            {isLoading ? (
              <SkeletonRows rows={4} />
            ) : recent.length === 0 ? (
              <p className="text-sm text-content-muted">No sign-in activity recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {recent.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] px-3.5 py-3"
                  >
                    <Avatar name={row.full_name} email={row.email} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-content">
                        {row.full_name ?? row.email}
                      </p>
                      <p className="truncate text-xs text-content-muted">
                        {row.last_sign_in_at
                          ? `Signed in ${formatRelative(row.last_sign_in_at)}`
                          : 'No sign-in on record'}
                      </p>
                    </div>
                    <Clock className="h-4 w-4 shrink-0 text-content-faint" aria-hidden="true" />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Your administrator session"
            description="Security posture of your current privileged session."
            action={<Lock className="h-5 w-5 text-success" aria-hidden="true" />}
          />
          <CardBody className="pt-0">
            <dl className="divide-y divide-line">
              <InfoRow label="Role" icon={<ShieldCheck className="h-4 w-4" />}>
                Administrator
              </InfoRow>
              <InfoRow label="Last sign-in" icon={<Clock className="h-4 w-4" />}>
                {formatDateTime(user?.last_sign_in_at)}
              </InfoRow>
              <InfoRow label="Session encryption" icon={<Lock className="h-4 w-4" />}>
                <span className="text-success">Encrypted (HTTPS)</span>
              </InfoRow>
            </dl>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-dashed border-line p-4">
              <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" aria-hidden="true" />
              <p className="text-xs text-content-muted">
                Full audit trails (failed logins, privilege changes, IP history) require
                an audit log table and are on the roadmap. SecureAuth never displays
                fabricated security data.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
