import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchUsersPage, type ListUsersParams } from '@/lib/services/admin';
import type { AdminUserRow, UserRole } from '@/types/database';
import { toFriendlyMessage } from '@/lib/errors';

export interface UseAdminUsersResult {
  rows: AdminUserRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setRole: (role: UserRole | 'all') => void;
  setVerified: (verified: 'all' | 'verified' | 'unverified') => void;
  refetch: () => void;
}

/**
 * Stateful wrapper around the `admin_users_page` RPC.
 * All filtering and pagination happen server-side under an admin-only policy.
 */
export function useAdminUsers(initialPageSize = 8): UseAdminUsersResult {
  const [page, setPageState] = useState(1);
  const [search, setSearchState] = useState('');
  const [role, setRoleState] = useState<UserRole | 'all'>('all');
  const [verified, setVerifiedState] = useState<'all' | 'verified' | 'unverified'>('all');

  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    const params: ListUsersParams = { page, pageSize: initialPageSize, search, role, verified };
    try {
      const result = await fetchUsersPage(params);
      if (id !== requestId.current) return; // stale response
      setRows(result.rows);
      setTotal(result.total);
    } catch (err) {
      if (id !== requestId.current) return;
      setRows([]);
      setTotal(0);
      setError(toFriendlyMessage(err, 'We could not load users. Please try again.'));
    } finally {
      if (id === requestId.current) setIsLoading(false);
    }
  }, [page, initialPageSize, search, role, verified]);

  useEffect(() => {
    void load();
  }, [load, reloadKey]);

  const setPage = useCallback((next: number) => setPageState(Math.max(1, next)), []);

  const setSearch = useCallback((next: string) => {
    setSearchState(next);
    setPageState(1);
  }, []);

  const setRole = useCallback((next: UserRole | 'all') => {
    setRoleState(next);
    setPageState(1);
  }, []);

  const setVerified = useCallback((next: 'all' | 'verified' | 'unverified') => {
    setVerifiedState(next);
    setPageState(1);
  }, []);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  const totalPages = Math.max(1, Math.ceil(total / initialPageSize));

  return {
    rows,
    total,
    page,
    pageSize: initialPageSize,
    totalPages,
    isLoading,
    error,
    setPage,
    setSearch,
    setRole,
    setVerified,
    refetch,
  };
}
