
-- Track daily habit completions per user
CREATE TABLE public.daily_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_count INTEGER NOT NULL DEFAULT 0,
  total_count INTEGER NOT NULL DEFAULT 0,
  all_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, completion_date)
);

ALTER TABLE public.daily_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own completions" ON public.daily_completions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON public.daily_completions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own completions" ON public.daily_completions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
-- Allow reading all for leaderboard
CREATE POLICY "Anyone can read completions for leaderboard" ON public.daily_completions FOR SELECT TO authenticated USING (true);

-- Function to calculate streak for a user
CREATE OR REPLACE FUNCTION public.calculate_streak(_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  found BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM public.daily_completions
      WHERE user_id = _user_id AND completion_date = check_date AND all_completed = true
    ) INTO found;
    
    IF NOT found THEN
      -- If today not completed, check if yesterday starts the streak
      IF check_date = CURRENT_DATE THEN
        check_date := check_date - 1;
        CONTINUE;
      END IF;
      EXIT;
    END IF;
    
    streak := streak + 1;
    check_date := check_date - 1;
  END LOOP;
  
  RETURN streak;
END;
$$;
