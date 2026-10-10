import { describe, expect, it } from 'vitest';
import {
  GENERIC_AUTH_ERROR,
  isSessionExpiredError,
  toFriendlyMessage,
} from '@/lib/errors';

describe('toFriendlyMessage', () => {
  it('maps invalid credentials to a generic message (no user enumeration)', () => {
    const message = toFriendlyMessage({ message: 'Invalid login credentials' });
    expect(message).toBe(GENERIC_AUTH_ERROR);
    expect(message).not.toMatch(/email/i);
  });

  it('maps unconfirmed email to an actionable message', () => {
    expect(toFriendlyMessage({ message: 'Email not confirmed' })).toMatch(/confirm/i);
  });

  it('maps rate limiting', () => {
    expect(toFriendlyMessage({ message: 'Too many requests' })).toMatch(/wait/i);
  });

  it('maps expired or invalid tokens', () => {
    expect(toFriendlyMessage({ message: 'Token has expired or is invalid' })).toMatch(
      /invalid or has expired/i,
    );
  });

  it('returns the fallback for unknown errors', () => {
    expect(toFriendlyMessage({ message: 'Some unforeseen failure' }, 'Fallback')).toBe('Fallback');
  });
});

describe('isSessionExpiredError', () => {
  it('detects expired JWTs', () => {
    expect(isSessionExpiredError({ message: 'JWT expired' })).toBe(true);
    expect(isSessionExpiredError({ message: 'Invalid Refresh Token' })).toBe(true);
  });

  it('returns false for unrelated errors', () => {
    expect(isSessionExpiredError({ message: 'Invalid login credentials' })).toBe(false);
    expect(isSessionExpiredError(null)).toBe(false);
  });
});
