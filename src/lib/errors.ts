/**
 * Centralised, safe error messaging.
 *
 * Authentication errors are deliberately generic so that we never reveal
 * whether an email address is registered (OWASP Authentication Cheat Sheet).
 * Raw provider errors are mapped to friendly, non-enumerating copy.
 */

export const GENERIC_AUTH_ERROR =
  'We could not sign you in with those credentials. Please check your details and try again.';

export const GENERIC_RESET_MESSAGE =
  'If an account exists for that email address, a password reset link is on its way.';

export const GENERIC_REGISTER_MESSAGE =
  'Check your inbox to confirm your email address. If you already have an account, try signing in instead.';

type SupabaseLikeError = {
  message?: string;
  status?: number;
  code?: string;
};

const FRIENDLY_MESSAGES: Array<[RegExp, string]> = [
  [/invalid login credentials/i, GENERIC_AUTH_ERROR],
  [/email not confirmed/i, 'Please confirm your email address before signing in.'],
  [
    /user already registered|already been registered/i,
    'If an account exists for that email, we have sent account instructions.',
  ],
  [/password should be at least/i, 'Your password does not meet the minimum requirements.'],
  [/rate limit|too many requests/i, 'Too many attempts. Please wait a moment and try again.'],
  [/network|fetch failed|failed to fetch/i, 'Network error. Please check your connection and try again.'],
  [/token has expired|invalid token|otp/i, 'This link is invalid or has expired. Please request a new one.'],
  [/same password/i, 'Choose a password different from your current one.'],
];

export function toFriendlyMessage(error: unknown, fallback = GENERIC_AUTH_ERROR): string {
  if (!error) return fallback;

  const candidate = error as SupabaseLikeError;
  const raw = typeof candidate.message === 'string' ? candidate.message : String(error);

  for (const [pattern, message] of FRIENDLY_MESSAGES) {
    if (pattern.test(raw)) return message;
  }

  if (import.meta.env.DEV && import.meta.env.MODE !== 'test') {
    // Surface real provider messages in local dev only. Never in production.
    return raw || fallback;
  }

  return fallback;
}

/** Returns true when a Supabase error indicates an expired/missing session. */
export function isSessionExpiredError(error: unknown): boolean {
  if (!error) return false;
  const candidate = error as SupabaseLikeError;
  const raw = typeof candidate.message === 'string' ? candidate.message : String(error);
  return /jwt expired|invalid jwt|session.*expired|refresh token/i.test(raw);
}
