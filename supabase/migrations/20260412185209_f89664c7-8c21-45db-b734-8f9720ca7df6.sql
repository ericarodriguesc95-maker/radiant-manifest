
-- Recreate view WITHOUT security_invoker so it can bypass owner-only RLS
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public AS
SELECT id, user_id, display_name, avatar_url, bio, cover_url, cover_position, created_at, updated_at
FROM public.profiles;

-- Grant access to authenticated users
GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_public TO anon;
