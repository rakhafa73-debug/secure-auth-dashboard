/**
 * Environment configuration.
 *
 * Reads and validates the public Vite environment variables exactly once.
 * Only `VITE_*` variables are exposed to the client bundle, and these must
 * ONLY ever contain the Supabase anon public key — never the service role key.
 */

export interface AppEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
  siteUrl: string;
}

type RawEnv = Record<string, string | undefined>;

function required(env: RawEnv, key: string): string {
  const value = env[key];
  if (!value || value.trim().length === 0) {
    throw new Error(
      `Missing required environment variable "${key}". ` +
        'Copy .env.example to .env.local and provide a value.',
    );
  }
  return value.trim();
}

function resolveSiteUrl(env: RawEnv): string {
  const configured = env.VITE_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');
  // Fall back to the current origin when running in a browser.
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'http://localhost:5173';
}

export function readEnv(env: RawEnv = import.meta.env as unknown as RawEnv): AppEnv {
  return {
    supabaseUrl: required(env, 'VITE_SUPABASE_URL'),
    supabaseAnonKey: required(env, 'VITE_SUPABASE_ANON_KEY'),
    siteUrl: resolveSiteUrl(env),
  };
}

let cached: AppEnv | null = null;

/** Lazily resolves and caches the validated environment. */
export function getEnv(): AppEnv {
  if (!cached) {
    cached = readEnv();
  }
  return cached;
}
