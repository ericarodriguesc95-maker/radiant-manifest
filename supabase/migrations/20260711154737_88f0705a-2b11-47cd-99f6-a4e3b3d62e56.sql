CREATE TABLE public.monthly_routine_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_start DATE NOT NULL,
  answer_1 TEXT NOT NULL CHECK (answer_1 IN ('A','B','C')),
  answer_2 TEXT NOT NULL CHECK (answer_2 IN ('A','B','C')),
  answer_3 TEXT NOT NULL CHECK (answer_3 IN ('A','B','C')),
  profile TEXT NOT NULL CHECK (profile IN ('A','B','C')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, month_start)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_routine_checkins TO authenticated;
GRANT ALL ON public.monthly_routine_checkins TO service_role;

ALTER TABLE public.monthly_routine_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own routine checkins"
  ON public.monthly_routine_checkins
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_monthly_routine_checkins_updated_at
  BEFORE UPDATE ON public.monthly_routine_checkins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();