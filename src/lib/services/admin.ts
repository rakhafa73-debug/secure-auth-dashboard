import { getSupabaseClient } from '@/lib/supabase';
import type {
  AdminPlatformStats,
  AdminUserRow,
  AdminUsersPage,
  UserRole,
} from '@/types/database';

/**
 * Administrator data-access.
 *
 * Every function below calls a SECURITY DEFINER Postgres function that
 * re-checks `is_admin()` server-side. The frontend never trusts its own role
 * check alone — an unprivileged caller receives an error from the database.
 */

export interface ListUsersParams {
  search?: string;
  role?: UserRole | 'all';
  verified?: 'all' | 'verified' | 'unverified';
  page?: number;
  pageSize?: number;
}

export interface ListUsersResult {
  rows: AdminUserRow[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchPlatformStats(): Promise<AdminPlatformStats> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('admin_platform_stats');
  if (error) throw error;
  return data as AdminPlatformStats;
}

export async function fetchUsersPage(params: ListUsersParams = {}): Promise<ListUsersResult> {
  const supabase = getSupabaseClient();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;

  const roleFilter =
    params.role && params.role !== 'all' ? params.role : null;

  const verifiedFilter =
    params.verified === 'verified'
      ? true
      : params.verified === 'unverified'
        ? false
        : null;

  const { data, error } = await supabase.rpc('admin_users_page', {
    search_term: params.search?.trim() ? params.search.trim() : null,
    role_filter: roleFilter,
    verified_filter: verifiedFilter,
    page_number: page,
    page_size: pageSize,
  });

  if (error) throw error;
  const result = data as AdminUsersPage;
  return {
    rows: result?.rows ?? [],
    total: result?.total ?? 0,
    page,
    pageSize,
  };
}

export async function setUserRole(targetUserId: string, role: UserRole): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc('admin_set_user_role', {
    target_user: targetUserId,
    new_role: role,
  });
  if (error) throw error;
}
