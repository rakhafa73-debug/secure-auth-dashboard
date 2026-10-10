import { useCallback, useEffect, useState } from 'react';
import {
  BadgeCheck,
  MailWarning,
  ShieldAlert,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Alert, Button, Card, CardBody, CardHeader, Skeleton } from '@/components/ui';
import { StatCard } from '@/components/dashboard/StatCard';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { fetchPlatformStats } from '@/lib/services/admin';
import { toFriendlyMessage } from '@/lib/errors';
import { formatNumber } from '@/lib/format';
import type { AdminPlatformStats } from '@/types/database';

export default function AdminOverview() {
  useDocumentTitle('Admin overview');
  const [stats, setStats] = useState<AdminPlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchPlatformStats();
      setStats(result);
    } catch (err) {
      setStats(null);
      setError(toFriendlyMessage(err, 'We could not load platform statistics.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const verificationRate =
    stats && stats.total_users > 0
      ? Math.round((stats.verified_users / stats.total_users) * 100)
      : 0;

  return (
    <div>
      <PageHeader
        title="Admin overview"
        description="Real-time account metrics computed directly from your database."
        action={
          <Button variant="secondary" size="sm" onClick={() => void load()} isLoading={isLoading}>
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="mb-6">
          <Alert tone="error" title="Statistics unavailable">
            {error}{' '}
            <button onClick={() => void load()} className="font-semibold underline">
              Retry
            </button>
          </Alert>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total users"
          value={formatNumber(stats?.total_users)}
          icon={<Users className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Verified accounts"
          value={formatNumber(stats?.verified_users)}
          icon={<BadgeCheck className="h-4 w-4" />}
          tone="success"
          hint={!isLoading ? `${verificationRate}% verification rate` : undefined}
          isLoading={isLoading}
        />
        <StatCard
          label="Unverified accounts"
          value={formatNumber(stats?.unverified_users)}
          icon={<MailWarning className="h-4 w-4" />}
          tone="warning"
          isLoading={isLoading}
        />
        <StatCard
          label="Administrators"
          value={formatNumber(stats?.admin_count)}
          icon={<ShieldAlert className="h-4 w-4" />}
          tone="primary"
          isLoading={isLoading}
        />
        <StatCard
          label="New in last 7 days"
          value={formatNumber(stats?.new_users_7d)}
          icon={<UserPlus className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatCard
          label="New in last 30 days"
          value={formatNumber(stats?.new_users_30d)}
          icon={<TrendingUp className="h-4 w-4" />}
          isLoading={isLoading}
        />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Authentication activity"
          description="Sign-in telemetry available from the identity provider."
        />
        <CardBody className="pt-0">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <div className="rounded-xl border border-line bg-white/[0.02] p-4 text-sm text-content-muted">
              <p>
                Detailed authentication audit logging (sign-in events, IP addresses,
                failed attempts) is planned for a future release. SecureAuth currently
                reports only metrics that are available directly from the identity
                provider — we never fabricate activity data.
              </p>
              <p className="mt-3 text-xs text-content-faint">
                Last refreshed: {new Date().toLocaleTimeString()}
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
