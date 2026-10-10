import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getEnv } from './env';
import { authStorage } from './authStorage';
import type { Database } from '@/types/database';

/**
 * Singleton Supabase browser client.
 *
 * Security notes:
 * - Only the anon public key is used here. The service role key must never
 *   reach the client.
 * - Sessions are persisted by supabase-js in localStorage under a namespaced
 *   key managed by the library. We never write tokens to localStorage manually.
 * - `detectSessionInUrl` is required so the PKCE code in email confirmation /
 *   password recovery links is exchanged automatically.
 */
let client: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (client) return client;

  const env = getEnv();

  client = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storageKey: 'secureauth.auth',
      storage: authStorage,
    },
    global: {
      headers: { 'x-client-info': 'secureauth-web' },
    },
  });

  return client;
}

/**
 * Typed lazy proxy so modules can `import { supabase }` without triggering
 * environment validation at import time (important for tests / SSR safety).
 */
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabaseClient(), prop, receiver);
  },
});
