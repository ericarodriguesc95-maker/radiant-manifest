
CREATE TABLE IF NOT EXISTS public.monthly_closure_rituals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_start DATE NOT NULL,
  biggest_win TEXT NOT NULL,
  adjustment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, month_start)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_closure_rituals TO authenticated;
GRANT ALL ON public.monthly_closure_rituals TO service_role;

ALTER TABLE public.monthly_closure_rituals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own closure rituals"
ON public.monthly_closure_rituals
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_monthly_closure_rituals_updated_at
BEFORE UPDATE ON public.monthly_closure_rituals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
