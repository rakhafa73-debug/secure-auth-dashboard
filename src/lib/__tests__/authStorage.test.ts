import { beforeEach, describe, expect, it } from 'vitest';
import { authStorage, getRememberPreference, setRememberPreference } from '@/lib/authStorage';

describe('authStorage "Remember me" behaviour', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('persists to localStorage when remember is enabled', () => {
    setRememberPreference(true);
    authStorage.setItem('token', 'abc');
    expect(localStorage.getItem('token')).toBe('abc');
    expect(sessionStorage.getItem('token')).toBeNull();
  });

  it('persists to sessionStorage when remember is disabled', () => {
    setRememberPreference(false);
    authStorage.setItem('token', 'abc');
    expect(sessionStorage.getItem('token')).toBe('abc');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('migrates the value between stores when preference changes', () => {
    setRememberPreference(false);
    authStorage.setItem('token', 'one');
    setRememberPreference(true);
    authStorage.setItem('token', 'two');
    expect(localStorage.getItem('token')).toBe('two');
    expect(sessionStorage.getItem('token')).toBeNull();
  });

  it('reads from either store', () => {
    localStorage.setItem('k', 'local-value');
    expect(authStorage.getItem('k')).toBe('local-value');
  });

  it('removes values from both stores', () => {
    setRememberPreference(true);
    authStorage.setItem('token', 'abc');
    authStorage.removeItem('token');
    expect(localStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('token')).toBeNull();
  });

  it('tracks the remember preference', () => {
    setRememberPreference(true);
    expect(getRememberPreference()).toBe(true);
    setRememberPreference(false);
    expect(getRememberPreference()).toBe(false);
  });

  it('always persists the PKCE code verifier to localStorage for cross-session links', () => {
    setRememberPreference(false);
    authStorage.setItem('secureauth.auth-code-verifier', 'verifier');
    expect(localStorage.getItem('secureauth.auth-code-verifier')).toBe('verifier');
    expect(sessionStorage.getItem('secureauth.auth-code-verifier')).toBeNull();
    expect(authStorage.getItem('secureauth.auth-code-verifier')).toBe('verifier');
  });
});
