import { describe, expect, it } from 'vitest';
import {
  emailSchema,
  evaluatePassword,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '@/lib/validation';

describe('validation schemas', () => {
  describe('emailSchema', () => {
    it('accepts valid emails', () => {
      expect(emailSchema.safeParse('ada@example.com').success).toBe(true);
    });

    it('rejects malformed emails', () => {
      const result = emailSchema.safeParse('not-an-email');
      expect(result.success).toBe(false);
    });

    it('trims surrounding whitespace', () => {
      const result = emailSchema.safeParse('  ada@example.com  ');
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe('ada@example.com');
    });
  });

  describe('registerSchema', () => {
    const valid = {
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'Sup3r-Secret!',
      confirmPassword: 'Sup3r-Secret!',
      acceptTerms: true as const,
    };

    it('accepts a complete, strong registration', () => {
      expect(registerSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects mismatched passwords', () => {
      const result = registerSchema.safeParse({ ...valid, confirmPassword: 'Different!123' });
      expect(result.success).toBe(false);
    });

    it('rejects weak passwords', () => {
      const result = registerSchema.safeParse({ ...valid, password: 'weak', confirmPassword: 'weak' });
      expect(result.success).toBe(false);
    });

    it('requires accepting the terms', () => {
      const result = registerSchema.safeParse({ ...valid, acceptTerms: false });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('accepts valid credentials', () => {
      const result = loginSchema.safeParse({ email: 'a@b.com', password: 'x', remember: true });
      expect(result.success).toBe(true);
    });

    it('rejects empty password', () => {
      const result = loginSchema.safeParse({ email: 'a@b.com', password: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('requires a valid email', () => {
      expect(forgotPasswordSchema.safeParse({ email: 'bad' }).success).toBe(false);
      expect(forgotPasswordSchema.safeParse({ email: 'ok@x.com' }).success).toBe(true);
    });
  });

  describe('resetPasswordSchema', () => {
    it('enforces matching strong passwords', () => {
      expect(
        resetPasswordSchema.safeParse({ password: 'Sup3r-Secret!', confirmPassword: 'Sup3r-Secret!' })
          .success,
      ).toBe(true);
      expect(
        resetPasswordSchema.safeParse({ password: 'Sup3r-Secret!', confirmPassword: 'nope' }).success,
      ).toBe(false);
    });
  });
});

describe('evaluatePassword', () => {
  it('flags a fully compliant password as strong', () => {
    const result = evaluatePassword('Sup3r-Secret!');
    expect(result.isStrong).toBe(true);
    expect(result.met).toBe(result.total);
  });

  it('counts partially compliant passwords', () => {
    const result = evaluatePassword('alllowercase');
    expect(result.isStrong).toBe(false);
    expect(result.met).toBeGreaterThan(0);
    expect(result.met).toBeLessThan(result.total);
  });

  it('treats an empty string as zero requirements met', () => {
    expect(evaluatePassword('').met).toBe(0);
  });
});
