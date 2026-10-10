import { describe, expect, it } from 'vitest';
import { safeRedirectPath } from '@/lib/redirect';

describe('safeRedirectPath', () => {
  it('allows internal dashboard paths', () => {
    expect(safeRedirectPath('/dashboard')).toBe('/dashboard');
    expect(safeRedirectPath('/admin/users')).toBe('/admin/users');
    expect(safeRedirectPath('/security?tab=password')).toBe('/security?tab=password');
  });

  it('rejects absolute external URLs', () => {
    expect(safeRedirectPath('https://evil.example.com')).toBeNull();
    expect(safeRedirectPath('http://evil.example.com/dashboard')).toBeNull();
  });

  it('rejects protocol-relative URLs', () => {
    expect(safeRedirectPath('//evil.example.com/dashboard')).toBeNull();
  });

  it('rejects paths outside the allow-list', () => {
    expect(safeRedirectPath('/etc/passwd')).toBeNull();
    expect(safeRedirectPath('/login')).toBeNull();
  });

  it('strips control characters and backslashes', () => {
    expect(safeRedirectPath('/dashboard\u0000')).toBeNull();
    expect(safeRedirectPath('/dashboard\\..\\admin')).toBeNull();
  });

  it('returns the provided fallback for invalid input', () => {
    expect(safeRedirectPath('https://evil.com', '/dashboard')).toBe('/dashboard');
    expect(safeRedirectPath(null, '/admin')).toBe('/admin');
  });

  it('returns null when no fallback is provided', () => {
    expect(safeRedirectPath('')).toBeNull();
    expect(safeRedirectPath(null)).toBeNull();
  });
});
