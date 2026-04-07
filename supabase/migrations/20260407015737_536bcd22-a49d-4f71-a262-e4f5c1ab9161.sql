
CREATE TABLE public.bible_reading_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  completed_days integer[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.bible_reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own progress" ON public.bible_reading_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.bible_reading_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.bible_reading_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
