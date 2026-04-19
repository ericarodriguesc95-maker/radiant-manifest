CREATE TABLE public.sleep_diagnostics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bed_time TEXT NOT NULL,
  sleep_time TEXT NOT NULL,
  wake_time TEXT NOT NULL,
  energy_morning INTEGER NOT NULL,
  energy_afternoon INTEGER NOT NULL,
  caffeine_alcohol TEXT,
  chronotype TEXT,
  ai_plan TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sleep_diagnostics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sleep diagnostics"
  ON public.sleep_diagnostics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sleep diagnostics"
  ON public.sleep_diagnostics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sleep diagnostics"
  ON public.sleep_diagnostics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sleep diagnostics"
  ON public.sleep_diagnostics FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_sleep_diagnostics_updated_at
  BEFORE UPDATE ON public.sleep_diagnostics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_sleep_diagnostics_user_created ON public.sleep_diagnostics(user_id, created_at DESC);