-- 1. Restrict profiles SELECT: drop the broad "Authenticated users can view all profiles" policy.
-- Other users will read non-sensitive fields via the public.profiles_public view.
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

-- The remaining "Users can view their own profile" policy (USING auth.uid() = user_id) still allows
-- a user to read their own row directly (including phone_number).

-- 2. Recreate profiles_public view with security_invoker=on so it respects the caller's RLS,
-- and grant read access. We must allow other users' rows to be visible THROUGH the view only,
-- so we add a permissive SELECT policy on profiles that excludes phone_number is impossible at
-- the row level — instead the view simply omits sensitive columns and we add a policy allowing
-- authenticated users to SELECT non-sensitive columns. Postgres RLS is row-level, not column-level,
-- so to make this work with security_invoker we re-add a policy that lets authenticated users see
-- all rows; the view restricts which COLUMNS can be selected from app code, but a malicious user
-- could still query the table directly. To truly hide phone_number we keep the own-row-only
-- policy on the base table and use a SECURITY DEFINER view limited to safe columns.
--
-- Since SUPA_security_definer_view warns about SECURITY DEFINER views, we use the alternative:
-- Keep base table own-row only, and create a SECURITY INVOKER view backed by a security definer
-- function that returns only safe columns.

-- Drop and recreate the view explicitly with security_invoker
DROP VIEW IF EXISTS public.profiles_public;

-- Create a SECURITY DEFINER function that returns safe public profile fields for any user
CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  display_name text,
  avatar_url text,
  bio text,
  cover_url text,
  cover_position integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, user_id, display_name, avatar_url, bio, cover_url, cover_position, created_at, updated_at
  FROM public.profiles;
$$;

REVOKE ALL ON FUNCTION public.get_public_profiles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_profiles() TO authenticated;

-- Recreate the view with security_invoker=on, backed by the function (no sensitive columns).
CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT * FROM public.get_public_profiles();

GRANT SELECT ON public.profiles_public TO authenticated;

-- 3. Lock down storage.objects SELECT for the health-media bucket to owner only.
DROP POLICY IF EXISTS "Anyone can read health media" ON storage.objects;
-- "Users can view own health media" already exists with the owner-scoped check.