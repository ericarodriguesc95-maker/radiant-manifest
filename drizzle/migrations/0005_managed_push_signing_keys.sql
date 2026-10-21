ALTER TABLE public.notification_scheduler_config ADD COLUMN IF NOT EXISTS vapid_keys jsonb;
CREATE OR REPLACE FUNCTION public.get_notification_public_key() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT vapid_keys->>'publicKey' FROM public.notification_scheduler_config WHERE id=true $$;
REVOKE ALL ON FUNCTION public.get_notification_public_key() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_notification_public_key() TO authenticated, service_role;