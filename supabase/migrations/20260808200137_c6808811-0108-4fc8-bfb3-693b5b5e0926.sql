ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date date;

CREATE TABLE IF NOT EXISTS public.birthday_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  year integer NOT NULL,
  post_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, year)
);

GRANT SELECT ON public.birthday_posts TO authenticated;
GRANT ALL ON public.birthday_posts TO service_role;

ALTER TABLE public.birthday_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view birthday posts"
ON public.birthday_posts FOR SELECT TO authenticated USING (true);