import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck,
  ShieldOff,
  X,
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
  Input,
  Select,
  SkeletonRows,
} from '@/components/ui';
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog';
import { EmptyState, PageHeader } from '@/components/dashboard/PageHeader';
import { setUserRole } from '@/lib/services/admin';
import { useAuth } from '@/contexts/auth-context';
import { toFriendlyMessage } from '@/lib/errors';
import { formatDate, formatRelative } from '@/lib/format';
import type { AdminUserRow, UserRole } from '@/types/database';

export default function UserManagement() {
  useDocumentTitle('User management');
  const { user: currentUser } = useAuth();

  const {
    rows,
    total,
    page,
    pageSize,
    totalPages,
    isLoading,
    error,
    setPage,
    setSearch,
    setRole,
    setVerified,
    refetch,
  } = useAdminUsers(8);

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 350);

  // Apply the debounced search term to the server-side query.
  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const [pending, setPending] = useState<{ user: AdminUserRow; nextRole: UserRole } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const confirmRoleChange = async () => {
    if (!pending) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      await setUserRole(pending.user.id, pending.nextRole);
      setActionSuccess(
        `${pending.user.full_name ?? pending.user.email} is now ${
          pending.nextRole === 'admin' ? 'an administrator' : 'a member'
        }.`,
      );
      setPending(null);
      refetch();
    } catch (err) {
      setActionError(
        toFriendlyMessage(err, 'The role change was rejected. You may not have permission.'),
      );
      setPending(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div>
      <PageHeader
        title="User management"
        description={`${total} ${total === 1 ? 'account' : 'accounts'} in your workspace.`}
      />

      {actionSuccess && (
        <div className="mb-5">
          <Alert tone="success">{actionSuccess}</Alert>
        </div>
      )}
      {actionError && (
        <div className="mb-5">
          <Alert tone="error" title="Action failed">
            {actionError}
          </Alert>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px]">
        <Input
          label="Search users"
          hideLabel
          placeholder="Search by name or email…"
          leftIcon={<Search className="h-4 w-4" />}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search users"
        />
        <Select
          label="Filter by role"
          hideLabel
          aria-label="Filter by role"
          defaultValue="all"
          onChange={(e) => setRole(e.target.value as UserRole | 'all')}
        >
          <option value="all">All roles</option>
          <option value="user">Members</option>
          <option value="admin">Administrators</option>
        </Select>
        <Select
          label="Filter by verification"
          hideLabel
          aria-label="Filter by verification"
          defaultValue="all"
          onChange={(e) => setVerified(e.target.value as 'all' | 'verified' | 'unverified')}
        >
          <option value="all">All statuses</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </Select>
      </div>

      {searchInput && (
        <button
          type="button"
          onClick={() => setSearchInput('')}
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-content-muted hover:text-content"
        >
          <X className="h-3.5 w-3.5" />
          Clear search
        </button>
      )}

      <Card>
        <CardBody className="p-0 sm:p-0">
          {isLoading ? (
            <div className="p-5">
              <SkeletonRows rows={6} />
            </div>
          ) : error ? (
            <div className="p-5">
              <Alert tone="error" title="Could not load users">
                {error}{' '}
                <button onClick={refetch} className="font-semibold underline">
                  Retry
                </button>
              </Alert>
            </div>
          ) : rows.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="No users found"
                description="Try adjusting your search or filters."
                action={
                  searchInput ? (
                    <Button variant="secondary" size="sm" onClick={() => setSearchInput('')}>
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Registered users</caption>
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wide text-content-faint">
                      <th scope="col" className="px-5 py-3 font-medium">User</th>
                      <th scope="col" className="px-5 py-3 font-medium">Role</th>
                      <th scope="col" className="px-5 py-3 font-medium">Status</th>
                      <th scope="col" className="px-5 py-3 font-medium">Joined</th>
                      <th scope="col" className="px-5 py-3 font-medium">Last sign-in</th>
                      <th scope="col" className="px-5 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {rows.map((row) => (
                      <UserTableRow
                        key={row.id}
                        row={row}
                        isSelf={row.id === currentUser?.id}
                        onPromote={() => setPending({ user: row, nextRole: 'admin' })}
                        onDemote={() => setPending({ user: row, nextRole: 'user' })}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-line lg:hidden">
                {rows.map((row) => (
                  <UserCard
                    key={row.id}
                    row={row}
                    isSelf={row.id === currentUser?.id}
                    onPromote={() => setPending({ user: row, nextRole: 'admin' })}
                    onDemote={() => setPending({ user: row, nextRole: 'user' })}
                  />
                ))}
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {!isLoading && !error && rows.length > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-content-muted">
            Showing <span className="text-content">{from}</span>–
            <span className="text-content">{to}</span> of{' '}
            <span className="text-content">{total}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </Button>
            <span className="px-2 text-xs text-content-muted">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.nextRole === 'admin' ? 'Grant administrator access?' : 'Revoke administrator access?'}
        description={
          pending ? (
            <>
              You are about to{' '}
              <strong className="text-content">
                {pending.nextRole === 'admin' ? 'promote' : 'demote'}
              </strong>{' '}
              <strong className="text-content">
                {pending.user.full_name ?? pending.user.email}
              </strong>
              . This grants or removes privileged access to all user data.
            </>
          ) : null
        }
        confirmLabel={pending?.nextRole === 'admin' ? 'Grant admin' : 'Revoke admin'}
        tone={pending?.nextRole === 'admin' ? 'primary' : 'danger'}
        isLoading={isSubmitting}
        onConfirm={confirmRoleChange}
        onClose={() => setPending(null)}
      />
    </div>
  );
}

/** Applies the debounced search value to the data hook. */
function RoleActions({
  row,
  isSelf,
  onPromote,
  onDemote,
}: {
  row: AdminUserRow;
  isSelf: boolean;
  onPromote: () => void;
  onDemote: () => void;
}) {
  if (isSelf) {
    return (
      <span className="text-xs text-content-faint" title="You cannot change your own role">
        —
      </span>
    );
  }
  if (row.role === 'admin') {
    return (
      <Button variant="danger" size="sm" onClick={onDemote}>
        <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />
        Revoke
      </Button>
    );
  }
  return (
    <Button variant="secondary" size="sm" onClick={onPromote}>
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
      Make admin
    </Button>
  );
}

function UserTableRow({
  row,
  isSelf,
  onPromote,
  onDemote,
}: {
  row: AdminUserRow;
  isSelf: boolean;
  onPromote: () => void;
  onDemote: () => void;
}) {
  return (
    <tr className="transition-colors hover:bg-white/[0.02]">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar name={row.full_name} email={row.email} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-content">
              {row.full_name ?? 'Unnamed user'}
              {isSelf && <span className="ml-1.5 text-xs text-accent">(you)</span>}
            </p>
            <p className="truncate text-xs text-content-muted">{row.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <Badge tone={row.role === 'admin' ? 'primary' : 'neutral'}>
          {row.role === 'admin' ? 'Admin' : 'Member'}
        </Badge>
      </td>
      <td className="px-5 py-3.5">
        {row.email_confirmed_at ? (
          <Badge tone="success">Verified</Badge>
        ) : (
          <Badge tone="warning">Pending</Badge>
        )}
      </td>
      <td className="px-5 py-3.5 text-content-muted">{formatDate(row.created_at)}</td>
      <td className="px-5 py-3.5 text-content-muted">{formatRelative(row.last_sign_in_at)}</td>
      <td className="px-5 py-3.5 text-right">
        <div className="flex justify-end">
          <RoleActions row={row} isSelf={isSelf} onPromote={onPromote} onDemote={onDemote} />
        </div>
      </td>
    </tr>
  );
}

function UserCard({
  row,
  isSelf,
  onPromote,
  onDemote,
}: {
  row: AdminUserRow;
  isSelf: boolean;
  onPromote: () => void;
  onDemote: () => void;
}) {
  return (
    <div className="p-4">
      <div className="flex items-start gap-3">
        <Avatar name={row.full_name} email={row.email} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-content">
            {row.full_name ?? 'Unnamed user'}
            {isSelf && <span className="ml-1.5 text-xs text-accent">(you)</span>}
          </p>
          <p className="truncate text-xs text-content-muted">{row.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={row.role === 'admin' ? 'primary' : 'neutral'}>
              {row.role === 'admin' ? 'Admin' : 'Member'}
            </Badge>
            {row.email_confirmed_at ? (
              <Badge tone="success">Verified</Badge>
            ) : (
              <Badge tone="warning">Pending</Badge>
            )}
          </div>
          <p className="mt-2 text-xs text-content-faint">
            Joined {formatDate(row.created_at)} · Last sign-in {formatRelative(row.last_sign_in_at)}
          </p>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <RoleActions row={row} isSelf={isSelf} onPromote={onPromote} onDemote={onDemote} />
      </div>
    </div>
  );
}
