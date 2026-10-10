-- =============================================================================
-- SecureAuth — make the first administrator (trusted operator step)
-- =============================================================================
-- There is deliberately NO self-service way to become an admin. Run this once,
-- as a trusted operator, from the Supabase SQL Editor or the CLI:
--
--   psql "$DATABASE_URL" -f scripts/make-first-admin.sql
--   -- or paste into Dashboard > SQL Editor
--
-- Replace the email below with the address you registered with, then sign in
-- again (or refresh) so the new role is picked up.
-- =============================================================================

update public.profiles
   set role = 'admin'
 where email = 'REPLACE-WITH-YOUR-EMAIL@example.com';

-- Verify the change:
-- select id, email, role from public.profiles where role = 'admin';
