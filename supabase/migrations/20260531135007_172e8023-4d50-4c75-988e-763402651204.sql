
CREATE TABLE IF NOT EXISTS public.daily_devotionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  religion text NOT NULL,
  verse text NOT NULL,
  source text NOT NULL,
  reflection text NOT NULL,
  study text NOT NULL,
  practice text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (date, religion)
);

GRANT SELECT ON public.daily_devotionals TO anon, authenticated;
GRANT ALL ON public.daily_devotionals TO service_role;

ALTER TABLE public.daily_devotionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Daily devotionals readable by all"
ON public.daily_devotionals FOR SELECT
TO anon, authenticated
USING (true);

CREATE INDEX IF NOT EXISTS daily_devotionals_date_religion_idx
ON public.daily_devotionals (date, religion);
