-- =============================================================================
-- SecureAuth — 0002: administrator functions (server-authorised)
-- =============================================================================
-- Every function below re-checks `public.is_admin()` inside the database.
-- The frontend role check is only a UX convenience; these functions are the
-- real authorisation boundary. All are SECURITY DEFINER with a locked
-- search_path to prevent search_path hijacking.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Paginated + searchable user directory.
-- Returns { rows: AdminUserRow[], total: number }
-- ---------------------------------------------------------------------------
create or replace function public.admin_users_page(
  search_term     text   default null,
  role_filter     text   default null,
  verified_filter boolean default null,
  page_number     int    default 1,
  page_size       int    default 10
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_limit  int;
  v_offset int;
  v_total  bigint;
  v_rows   jsonb;
begin
  if not public.is_admin() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  v_limit  := least(greatest(coalesce(page_size, 10), 1), 100);
  v_offset := greatest(coalesce(page_number, 1) - 1, 0) * v_limit;

  select count(*)
    into v_total
  from public.profiles p
  join auth.users u on u.id = p.id
  where (
      search_term is null
      or search_term = ''
      or p.email ilike '%' || search_term || '%'
      or coalesce(p.full_name, '') ilike '%' || search_term || '%'
    )
    and (
      role_filter is null
      or role_filter = ''
      or p.role::text = role_filter
    )
    and (
      verified_filter is null
      or (u.email_confirmed_at is not null) = verified_filter
    );

  select coalesce(jsonb_agg(row_to_json(t)::jsonb), '[]'::jsonb)
    into v_rows
  from (
    select
      p.id::text            as id,
      p.email               as email,
      p.full_name           as full_name,
      p.role::text          as role,
      p.created_at          as created_at,
      p.updated_at          as updated_at,
      u.email_confirmed_at  as email_confirmed_at,
      u.last_sign_in_at     as last_sign_in_at
    from public.profiles p
    join auth.users u on u.id = p.id
    where (
        search_term is null
        or search_term = ''
        or p.email ilike '%' || search_term || '%'
        or coalesce(p.full_name, '') ilike '%' || search_term || '%'
      )
      and (
        role_filter is null
        or role_filter = ''
        or p.role::text = role_filter
      )
      and (
        verified_filter is null
        or (u.email_confirmed_at is not null) = verified_filter
      )
    order by p.created_at desc
    limit v_limit
    offset v_offset
  ) t;

  return jsonb_build_object('rows', v_rows, 'total', coalesce(v_total, 0));
end;
$$;

-- ---------------------------------------------------------------------------
-- Aggregate platform statistics (no fabricated values — all real counts).
-- ---------------------------------------------------------------------------
create or replace function public.admin_platform_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'total_users',      (select count(*) from public.profiles),
    'admin_count',      (select count(*) from public.profiles where role = 'admin'),
    'verified_users',   (
      select count(*)
      from public.profiles p
      join auth.users u on u.id = p.id
      where u.email_confirmed_at is not null
    ),
    'unverified_users', (
      select count(*)
      from public.profiles p
      join auth.users u on u.id = p.id
      where u.email_confirmed_at is null
    ),
    'new_users_7d',     (
      select count(*) from public.profiles where created_at >= now() - interval '7 days'
    ),
    'new_users_30d',    (
      select count(*) from public.profiles where created_at >= now() - interval '30 days'
    )
  )
  into v_result;

  return v_result;
end;
$$;

-- ---------------------------------------------------------------------------
-- Change another user's role. Guards:
--   * caller must be an administrator
--   * caller may not change their own role (prevents self-lockout/escalation)
--   * target must exist
-- ---------------------------------------------------------------------------
create or replace function public.admin_set_user_role(
  target_user uuid,
  new_role    public.user_role
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
begin
  if not public.is_admin() then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  if target_user = auth.uid() then
    raise exception 'cannot_change_own_role' using errcode = '42501';
  end if;

  update public.profiles
     set role = new_role
   where id = target_user
  returning * into v_profile;

  if v_profile.id is null then
    raise exception 'user_not_found' using errcode = 'P0002';
  end if;

  return v_profile;
end;
$$;

-- ---------------------------------------------------------------------------
-- Privileges: expose admin functions to authenticated users only. The
-- internal is_admin() check still blocks non-admins at runtime.
-- ---------------------------------------------------------------------------
revoke all on function public.admin_users_page(text, text, boolean, int, int) from public;
revoke all on function public.admin_platform_stats() from public;
revoke all on function public.admin_set_user_role(uuid, public.user_role) from public;

grant execute on function public.admin_users_page(text, text, boolean, int, int) to authenticated;
grant execute on function public.admin_platform_stats() to authenticated;
grant execute on function public.admin_set_user_role(uuid, public.user_role) to authenticated;
