import { createContext, useContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { Profile, UserRole } from '@/types/database';

export interface SignInInput {
  email: string;
  password: string;
  remember?: boolean;
}

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthContextValue {
  /** Supabase session, or null when signed out. */
  session: Session | null;
  /** Supabase auth user, or null when signed out. */
  user: User | null;
  /** Row from public.profiles for the current user. */
  profile: Profile | null;
  /** Resolved role — defaults to least privilege ("user"). */
  role: UserRole;
  /** True only when the verified profile role is 'admin'. */
  isAdmin: boolean;
  isAuthenticated: boolean;

  /** True after Supabase processes a password-recovery link. */
  isRecovery: boolean;

  /** True until the initial session/profile resolution completes. */
  isInitializing: boolean;
  /** True while a profile fetch/refresh is in flight. */
  isProfileLoading: boolean;
  /** Set when a previously valid session could not be refreshed. */
  sessionExpired: boolean;
  /** Clears the sessionExpired flag once acknowledged by the UI. */
  clearSessionExpired: () => void;

  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (input: { fullName: string }) => Promise<Profile>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>.');
  }
  return ctx;
}
