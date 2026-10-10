import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { AuthContext, type AuthContextValue, type SignInInput, type SignUpInput } from './auth-context';
import { getSupabaseClient } from '@/lib/supabase';
import { getEnv } from '@/lib/env';
import { setRememberPreference } from '@/lib/authStorage';
import { fetchProfile, updateOwnProfile } from '@/lib/services/profiles';
import { toFriendlyMessage } from '@/lib/errors';
import type { Profile, UserRole } from '@/types/database';

function resolveRole(profile: Profile | null): UserRole {
  // Least privilege by default: absence of a verified profile is never admin.
  return profile?.role === 'admin' ? 'admin' : 'user';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  const manualSignOutRef = useRef(false);
  const hadSessionRef = useRef(false);

  const loadProfile = useCallback(async (userId: string) => {
    setIsProfileLoading(true);
    try {
      const row = await fetchProfile(userId);
      setProfile(row);
    } catch (error) {
      // Never crash the app on a transient profile error; role falls back to user.
      if (import.meta.env.DEV) {
        console.warn('[auth] Failed to load profile:', toFriendlyMessage(error));
      }
      setProfile(null);
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabaseClient();
    let mounted = true;

    // Initial session resolution.
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
        if (data.session?.user) {
          hadSessionRef.current = true;
          void loadProfile(data.session.user.id);
        }
      })
      .finally(() => {
        if (mounted) setIsInitializing(false);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      switch (event) {
        case 'PASSWORD_RECOVERY':
          setIsRecovery(true);
          break;
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
        case 'USER_UPDATED':
          hadSessionRef.current = Boolean(nextSession);
          if (nextSession?.user) {
            void loadProfile(nextSession.user.id);
          }
          break;
        case 'SIGNED_OUT':
          setProfile(null);
          if (hadSessionRef.current && !manualSignOutRef.current) {
            setSessionExpired(true);
          }
          hadSessionRef.current = false;
          manualSignOutRef.current = false;
          break;
        default:
          break;
      }
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async ({ email, password, remember = false }: SignInInput) => {
    const supabase = getSupabaseClient();
    setRememberPreference(remember);
    setSessionExpired(false);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async ({ email, password, fullName }: SignUpInput) => {
    const supabase = getSupabaseClient();
    const { siteUrl } = getEnv();

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
        data: { full_name: fullName.trim() },
      },
    });
    if (error) throw error;

    // When email confirmation is required Supabase returns no session.
    const needsEmailConfirmation = !data.session;
    return { needsEmailConfirmation };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    manualSignOutRef.current = true;
    setIsRecovery(false);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const supabase = getSupabaseClient();
    const { siteUrl } = getEnv();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${siteUrl}/reset-password`,
    });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    setIsRecovery(false);
  }, []);

  const updateProfile = useCallback(
    async (input: { fullName: string }) => {
      if (!user) throw new Error('Not authenticated.');
      const updated = await updateOwnProfile(user.id, input);
      setProfile(updated);
      return updated;
    },
    [user],
  );

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await loadProfile(user.id);
  }, [user, loadProfile]);

  const clearSessionExpired = useCallback(() => setSessionExpired(false), []);

  const role = resolveRole(profile);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      role,
      isAdmin: role === 'admin',
      isAuthenticated: Boolean(session?.user),
      isRecovery,
      isInitializing,
      isProfileLoading,
      sessionExpired,
      clearSessionExpired,
      signIn,
      signUp,
      signOut,
      requestPasswordReset,
      updatePassword,
      updateProfile,
      refreshProfile,
    }),
    [
      session,
      user,
      profile,
      role,
      isRecovery,
      isInitializing,
      isProfileLoading,
      sessionExpired,
      clearSessionExpired,
      signIn,
      signUp,
      signOut,
      requestPasswordReset,
      updatePassword,
      updateProfile,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
