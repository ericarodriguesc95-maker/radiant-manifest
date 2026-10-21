CREATE TABLE public.notification_scheduler_config (id boolean PRIMARY KEY DEFAULT true CHECK (id = true), secret text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'));
REVOKE ALL ON public.notification_scheduler_config FROM anon, authenticated;
GRANT ALL ON public.notification_scheduler_config TO service_role;
ALTER TABLE public.notification_scheduler_config ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.notification_deliveries (user_id uuid NOT NULL, delivery_key text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id, delivery_key));
REVOKE ALL ON public.notification_deliveries FROM anon, authenticated;
GRANT ALL ON public.notification_deliveries TO service_role;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;