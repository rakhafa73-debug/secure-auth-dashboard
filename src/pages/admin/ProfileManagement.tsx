import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  Info,
  Mail,
  Search,
  Shield,
} from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useDebounce } from '@/hooks/useDebounce';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  SkeletonRows,
} from '@/components/ui';
import { EmptyState, InfoRow, PageHeader } from '@/components/dashboard/PageHeader';
import { formatDate, formatDateTime } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { AdminUserRow } from '@/types/database';

export default function ProfileManagement() {
  useDocumentTitle('Profile management');
  const {
    rows,
    total,
    page,
    totalPages,
    isLoading,
    error,
    setPage,
    setSearch,
    refetch,
  } = useAdminUsers(9);

  const [searchInput, setSearchInput] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debounced = useDebounce(searchInput, 350);

  useEffect(() => {
    setSearch(debounced);
  }, [debounced, setSearch]);

  const selected = useMemo(
    () => rows.find((r) => r.id === selectedId) ?? rows[0] ?? null,
    [rows, selectedId],
  );

  return (
    <div>
      <PageHeader
        title="Profile management"
        description="Browse account profiles and their identity attributes."
      />

      <Alert tone="info" className="mb-6">
        <span className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          For privacy and integrity, profile details can only be edited by their owner.
          Administrators have read access; edits are enforced by Row Level Security.
        </span>
      </Alert>

      <div className="mb-4 max-w-md">
        <Input
          label="Search profiles"
          hideLabel
          placeholder="Search by name or email…"
          leftIcon={<Search className="h-4 w-4" />}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search profiles"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader
            title="Profile directory"
            description={`${total} ${total === 1 ? 'profile' : 'profiles'}`}
          />
          <CardBody className="pt-0">
            {isLoading ? (
              <SkeletonRows rows={5} />
            ) : error ? (
              <Alert tone="error" title="Could not load profiles">
                {error}{' '}
                <button onClick={refetch} className="font-semibold underline">
                  Retry
                </button>
              </Alert>
            ) : rows.length === 0 ? (
              <EmptyState
                title="No profiles found"
                description="No profiles match your current search."
                action={
                  searchInput ? (
                    <Button variant="secondary" size="sm" onClick={() => setSearchInput('')}>
                      Clear search
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <>
                <ul className="space-y-2">
                  {rows.map((row) => (
                    <li key={row.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(row.id)}
                        aria-pressed={selected?.id === row.id}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                          selected?.id === row.id
                            ? 'border-primary/40 bg-primary/[0.07]'
                            : 'border-line bg-white/[0.02] hover:border-line-strong hover:bg-white/[0.04]',
                        )}
                      >
                        <Avatar name={row.full_name} email={row.email} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-content">
                            {row.full_name ?? 'Unnamed user'}
                          </span>
                          <span className="block truncate text-xs text-content-muted">
                            {row.email}
                          </span>
                        </span>
                        <Badge tone={row.role === 'admin' ? 'primary' : 'neutral'}>
                          {row.role === 'admin' ? 'Admin' : 'Member'}
                        </Badge>
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </Button>
                  <span className="text-xs text-content-muted">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        {/* Detail panel */}
        <Card className="lg:sticky lg:top-24 lg:self-start">
          <CardHeader title="Profile detail" />
          <CardBody className="pt-0">
            {selected ? (
              <ProfileDetail row={selected} />
            ) : (
              <p className="text-sm text-content-muted">Select a profile to view details.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function ProfileDetail({ row }: { row: AdminUserRow }) {
  return (
    <div>
      <div className="flex flex-col items-center pb-5 text-center">
        <Avatar name={row.full_name} email={row.email} size="xl" />
        <h3 className="mt-3 max-w-full truncate text-lg font-semibold text-content">
          {row.full_name ?? 'Unnamed user'}
        </h3>
        <p className="max-w-full truncate text-sm text-content-muted">{row.email}</p>
        <div className="mt-2">
          <Badge
            tone={row.role === 'admin' ? 'primary' : 'neutral'}
            icon={<Shield className="h-3.5 w-3.5" />}
          >
            {row.role === 'admin' ? 'Administrator' : 'Member'}
          </Badge>
        </div>
      </div>

      <dl className="divide-y divide-line">
        <InfoRow label="User ID" icon={<Fingerprint className="h-4 w-4" />}>
          <span className="font-mono text-xs" title={row.id}>
            {row.id.slice(0, 8)}…
          </span>
        </InfoRow>
        <InfoRow label="Email" icon={<Mail className="h-4 w-4" />}>
          {row.email}
        </InfoRow>
        <InfoRow label="Verification" icon={<BadgeCheck className="h-4 w-4" />}>
          {row.email_confirmed_at ? (
            <span className="text-success">Verified</span>
          ) : (
            <span className="text-amber-200">Pending</span>
          )}
        </InfoRow>
        <InfoRow label="Joined" icon={<CalendarDays className="h-4 w-4" />}>
          {formatDate(row.created_at)}
        </InfoRow>
        <InfoRow label="Last updated" icon={<CalendarDays className="h-4 w-4" />}>
          {formatDateTime(row.updated_at)}
        </InfoRow>
      </dl>
    </div>
  );
}
