-- =============================================================================
-- SecureAuth — 0001: profiles, roles, triggers and Row Level Security
-- =============================================================================
-- Run with the Supabase CLI (`supabase db push`) or paste into the Supabase
-- SQL editor (Dashboard > SQL Editor). Safe to run once on a fresh project.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Role enum. Least privilege: every account starts as 'user'.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('user', 'admin');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- profiles table (1:1 with auth.users). Passwords are NEVER stored here —
-- authentication is owned entirely by Supabase Auth (auth.users).
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  role        public.user_role not null default 'user',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint profiles_full_name_len check (full_name is null or char_length(full_name) <= 100)
);

comment on table public.profiles is
  'Public profile data for each authenticated user. Role is server-controlled.';

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create a profile row whenever a new auth user is created.
-- SECURITY DEFINER so the insert is performed by the (trusted) function owner
-- and cannot be blocked or spoofed by the calling client. Role is forced to
-- 'user' — self-registration as admin is impossible.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Security helper functions.
--
-- These are SECURITY DEFINER and therefore read `profiles` with the function
-- owner's privileges, bypassing RLS. This is the standard way to authorise
-- without creating recursive RLS policies (a policy on `profiles` that selects
-- from `profiles` directly would recurse).
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.role from public.profiles p where p.id = auth.uid()),
    'user'::public.user_role
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.current_user_role() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.current_user_role() to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Users may read only their own profile; administrators may read all.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

-- Users may update only their own row, and only if they do not change the
-- role. `current_user_role()` is SECURITY DEFINER, avoiding recursion.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = public.current_user_role()
  );

-- No client-side inserts or deletes. Inserts happen via the trigger above.
-- (No INSERT/DELETE policies => denied for anon/authenticated.)

-- ---------------------------------------------------------------------------
-- Table privileges. Column-level UPDATE grant means even a policy-compliant
-- client can only ever modify `full_name` — email and role are protected.
-- ---------------------------------------------------------------------------
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Lock down auth.users trigger creation safety note:
-- `ensure_rls` style hardening is left to Supabase defaults.
-- ---------------------------------------------------------------------------
