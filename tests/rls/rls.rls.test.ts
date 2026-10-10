import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * RLS / authorisation integration tests.
 *
 * These run ONLY when staging credentials are present. They exercise the real
 * database policies — the actual security boundary — rather than mocked code.
 *
 *   SUPABASE_TEST_URL
 *   SUPABASE_TEST_ANON_KEY
 *   SUPABASE_TEST_SERVICE_ROLE_KEY
 *
 * Create these users in a throwaway/staging project only.
 */

const URL = process.env.SUPABASE_TEST_URL;
const ANON = process.env.SUPABASE_TEST_ANON_KEY;
const SERVICE = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;

const enabled = Boolean(URL && ANON && SERVICE);

const password = 'Test-Password!23';
const stamp = Date.now();
const userAEmail = `rls-a-${stamp}@example.com`;
const userBEmail = `rls-b-${stamp}@example.com`;
const adminEmail = `rls-admin-${stamp}@example.com`;

function client(key: string): SupabaseClient {
  return createClient(URL as string, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

describe.skipIf(!enabled)('RLS policies', () => {
  let service: SupabaseClient;
  let userAId = '';
  let userBId = '';
  let adminId = '';

  async function createConfirmedUser(email: string): Promise<string> {
    const { data, error } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    return data.user!.id;
  }

  beforeAll(async () => {
    service = client(SERVICE as string);
    userAId = await createConfirmedUser(userAEmail);
    userBId = await createConfirmedUser(userBEmail);
    adminId = await createConfirmedUser(adminEmail);

    // Elevate the third account to admin using the service role (trusted path).
    const { error } = await service
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', adminId);
    if (error) throw error;
  });

  afterAll(async () => {
    if (!enabled) return;
    await service.auth.admin.deleteUser(userAId).catch(() => undefined);
    await service.auth.admin.deleteUser(userBId).catch(() => undefined);
    await service.auth.admin.deleteUser(adminId).catch(() => undefined);
  });

  it('auto-creates a profile with role "user" on signup', async () => {
    const { data, error } = await service
      .from('profiles')
      .select('id, role')
      .eq('id', userAId)
      .single();
    expect(error).toBeNull();
    expect(data?.role).toBe('user');
  });

  it('lets a user read only their own profile', async () => {
    const a = client(ANON as string);
    await a.auth.signInWithPassword({ email: userAEmail, password });

    const own = await a.from('profiles').select('id').eq('id', userAId);
    expect(own.error).toBeNull();
    expect(own.data?.map((r) => r.id)).toEqual([userAId]);

    // Attempting to read another user's row returns nothing (RLS filters it).
    const other = await a.from('profiles').select('id').eq('id', userBId);
    expect(other.data ?? []).toHaveLength(0);

    // Reading the full table only ever returns the caller's row.
    const all = await a.from('profiles').select('id');
    expect((all.data ?? []).every((r) => r.id === userAId)).toBe(true);
  });

  it('prevents a user from escalating their own role', async () => {
    const a = client(ANON as string);
    await a.auth.signInWithPassword({ email: userAEmail, password });

    const { error } = await a
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userAId);

    // Either the column grant rejects it, or the RLS WITH CHECK blocks it.
    expect(error).not.toBeNull();

    const check = await service
      .from('profiles')
      .select('role')
      .eq('id', userAId)
      .single();
    expect(check.data?.role).toBe('user');
  });

  it('allows a user to update their own full_name', async () => {
    const a = client(ANON as string);
    await a.auth.signInWithPassword({ email: userAEmail, password });

    const { error } = await a
      .from('profiles')
      .update({ full_name: 'Updated Name' })
      .eq('id', userAId);
    expect(error).toBeNull();

    const check = await service
      .from('profiles')
      .select('full_name')
      .eq('id', userAId)
      .single();
    expect(check.data?.full_name).toBe('Updated Name');
  });

  it('denies admin RPCs to non-admins', async () => {
    const a = client(ANON as string);
    await a.auth.signInWithPassword({ email: userAEmail, password });

    const stats = await a.rpc('admin_platform_stats');
    expect(stats.error).not.toBeNull();

    const promoted = await a.rpc('admin_set_user_role', {
      target_user: userBId,
      new_role: 'admin',
    });
    expect(promoted.error).not.toBeNull();
  });

  it('allows admins to read all profiles and change roles', async () => {
    const admin = client(ANON as string);
    await admin.auth.signInWithPassword({ email: adminEmail, password });

    const all = await admin.from('profiles').select('id');
    expect((all.data ?? []).length).toBeGreaterThanOrEqual(3);

    const stats = await admin.rpc('admin_platform_stats');
    expect(stats.error).toBeNull();
    expect(stats.data?.total_users).toBeGreaterThanOrEqual(3);

    const promote = await admin.rpc('admin_set_user_role', {
      target_user: userBId,
      new_role: 'admin',
    });
    expect(promote.error).toBeNull();

    // Restore for isolation.
    await service.from('profiles').update({ role: 'user' }).eq('id', userBId);
  });

  it('prevents an admin from changing their own role', async () => {
    const admin = client(ANON as string);
    await admin.auth.signInWithPassword({ email: adminEmail, password });

    const { error } = await admin.rpc('admin_set_user_role', {
      target_user: adminId,
      new_role: 'user',
    });
    expect(error).not.toBeNull();
  });
});

describe.skipIf(enabled)('RLS policies (skipped)', () => {
  it('requires SUPABASE_TEST_URL / ANON / SERVICE_ROLE_KEY to run', () => {
    expect(enabled).toBe(false);
  });
});
