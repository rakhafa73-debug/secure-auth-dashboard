import { z } from 'zod';

/**
 * Shared validation rules used by React Hook Form + Zod on the client.
 * Server/DB validation is still authoritative — this only improves UX.
 */

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required.')
  .email('Enter a valid email address.')
  .max(254, 'Email address is too long.');

export const passwordSchema = z
  .string()
  .min(12, 'Use at least 12 characters.')
  .max(72, 'Password must be 72 characters or fewer.')
  .regex(/[a-z]/, 'Add at least one lowercase letter.')
  .regex(/[A-Z]/, 'Add at least one uppercase letter.')
  .regex(/[0-9]/, 'Add at least one number.')
  .regex(/[^A-Za-z0-9]/, 'Add at least one symbol.');

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, 'Enter your full name.')
  .max(80, 'Name must be 80 characters or fewer.')
  .regex(/^[\p{L}\p{M}' .-]+$/u, 'Name contains unsupported characters.');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required.'),
  remember: z.boolean().optional().default(false),
});

export const registerSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms to continue.' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const updateProfileSchema = z.object({
  fullName: fullNameSchema,
});

export type LoginValues = z.input<typeof loginSchema>;
export type RegisterValues = z.input<typeof registerSchema>;
export type ForgotPasswordValues = z.input<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.input<typeof resetPasswordSchema>;
export type UpdateProfileValues = z.input<typeof updateProfileSchema>;

/**
 * Password strength metadata for the live requirements indicator.
 */
export interface PasswordRequirement {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { id: 'length', label: 'At least 12 characters', test: (v) => v.length >= 12 },
  { id: 'lower', label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  { id: 'upper', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { id: 'number', label: 'One number', test: (v) => /[0-9]/.test(v) },
  { id: 'symbol', label: 'One symbol', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export function evaluatePassword(value: string) {
  const results = PASSWORD_REQUIREMENTS.map((req) => ({
    ...req,
    met: req.test(value),
  }));
  const met = results.filter((r) => r.met).length;
  return {
    results,
    met,
    total: results.length,
    score: met / results.length,
    isStrong: met === results.length,
  };
}
