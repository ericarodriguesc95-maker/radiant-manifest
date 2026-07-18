
CREATE TABLE public.daily_checkpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkpoint_key TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, checkpoint_key, completion_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_checkpoints TO authenticated;
GRANT ALL ON public.daily_checkpoints TO service_role;

ALTER TABLE public.daily_checkpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own checkpoints"
  ON public.daily_checkpoints FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_daily_checkpoints_user_date ON public.daily_checkpoints (user_id, completion_date);
