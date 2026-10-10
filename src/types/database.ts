/**
 * Database types.
 *
 * These are declared as `type` aliases (not interfaces) on purpose: Supabase's
 * postgrest-js requires each row type to satisfy `Record<string, unknown>`, and
 * TypeScript only gives object type aliases an implicit index signature.
 *
 * In a real project these can be regenerated with:
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 */

export type UserRole = 'user' | 'admin';

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

/** Row shape returned by the `admin_users_page` RPC. */
export type AdminUserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
};

/** Shape returned by the `admin_platform_stats` RPC. */
export type AdminPlatformStats = {
  total_users: number;
  admin_count: number;
  verified_users: number;
  unverified_users: number;
  new_users_7d: number;
  new_users_30d: number;
};

/** Shape returned by the `admin_users_page` RPC. */
export type AdminUsersPage = {
  rows: AdminUserRow[];
  total: number;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      /** Returns the role of the currently authenticated caller. */
      current_user_role: {
        Args: Record<string, never>;
        Returns: UserRole;
      };
      /** True when the caller is an administrator. */
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      /** Paginated, searchable user list. Admin only. */
      admin_users_page: {
        Args: {
          search_term?: string | null;
          role_filter?: string | null;
          verified_filter?: boolean | null;
          page_number?: number;
          page_size?: number;
        };
        Returns: AdminUsersPage;
      };
      /** Aggregate platform statistics. Admin only. */
      admin_platform_stats: {
        Args: Record<string, never>;
        Returns: AdminPlatformStats;
      };
      /** Promote/demote a user. Admin only. Cannot change own role. */
      admin_set_user_role: {
        Args: { target_user: string; new_role: UserRole };
        Returns: Profile;
      };
    };
    Enums: {
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
