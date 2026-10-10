import { getSupabaseClient } from '@/lib/supabase';
import type { Profile } from '@/types/database';

/**
 * Data-access for the `profiles` table.
 *
 * Every call relies on Row Level Security: a signed-in user can only read and
 * update their own row, and cannot change the `role` column (enforced in SQL).
 */

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateOwnProfile(
  userId: string,
  input: { fullName: string },
): Promise<Profile> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name: input.fullName.trim() })
    .eq('id', userId)
    .select('id, email, full_name, role, created_at, updated_at')
    .single();

  if (error) throw error;
  return data;
}
