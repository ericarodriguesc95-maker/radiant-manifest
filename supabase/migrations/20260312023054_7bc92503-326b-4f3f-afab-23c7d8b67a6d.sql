
-- Table for tracking user's supplement registrations
CREATE TABLE public.user_supplements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  dose TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'suplemento',
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_supplements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own supplements" ON public.user_supplements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own supplements" ON public.user_supplements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own supplements" ON public.user_supplements FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own supplements" ON public.user_supplements FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Table for daily supplement check-ins
CREATE TABLE public.supplement_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  supplement_id UUID NOT NULL REFERENCES public.user_supplements(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  taken BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(supplement_id, checkin_date)
);

ALTER TABLE public.supplement_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own checkins" ON public.supplement_checkins FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checkins" ON public.supplement_checkins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checkins" ON public.supplement_checkins FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checkins" ON public.supplement_checkins FOR DELETE TO authenticated USING (auth.uid() = user_id);
