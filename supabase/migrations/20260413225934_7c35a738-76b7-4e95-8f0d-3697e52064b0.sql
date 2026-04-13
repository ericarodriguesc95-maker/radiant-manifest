
CREATE TABLE public.cycle_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE,
  cycle_length INTEGER,
  symptoms TEXT[] DEFAULT '{}',
  mood TEXT,
  flow_intensity TEXT DEFAULT 'medio',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cycle_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cycle logs" ON public.cycle_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cycle logs" ON public.cycle_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cycle logs" ON public.cycle_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cycle logs" ON public.cycle_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_cycle_logs_updated_at BEFORE UPDATE ON public.cycle_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
