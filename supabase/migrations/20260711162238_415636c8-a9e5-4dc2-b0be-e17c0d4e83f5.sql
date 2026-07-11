CREATE TABLE public.weekly_meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  plan_data JSONB NOT NULL,
  shopping_list JSONB,
  restrictions TEXT,
  preferences TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_meal_plans TO authenticated;
GRANT ALL ON public.weekly_meal_plans TO service_role;

ALTER TABLE public.weekly_meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own meal plans"
ON public.weekly_meal_plans FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_weekly_meal_plans_updated_at
BEFORE UPDATE ON public.weekly_meal_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();