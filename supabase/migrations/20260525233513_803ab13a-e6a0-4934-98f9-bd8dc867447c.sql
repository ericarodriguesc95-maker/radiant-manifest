
CREATE TABLE public.glow_move_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pillar_id TEXT NOT NULL,
  current_phase INTEGER NOT NULL DEFAULT 1,
  missions_in_phase INTEGER NOT NULL DEFAULT 0,
  glow_points INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE,
  unlocked BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, pillar_id)
);

ALTER TABLE public.glow_move_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own progress select" ON public.glow_move_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own progress insert" ON public.glow_move_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own progress update" ON public.glow_move_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own progress delete" ON public.glow_move_progress FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER glow_move_progress_updated_at
BEFORE UPDATE ON public.glow_move_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.glow_move_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pillar_id TEXT NOT NULL,
  phase INTEGER NOT NULL,
  mission_text TEXT NOT NULL,
  frase_ancora TEXT,
  tempo_estimado TEXT,
  reflection TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.glow_move_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own missions select" ON public.glow_move_missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own missions insert" ON public.glow_move_missions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own missions update" ON public.glow_move_missions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own missions delete" ON public.glow_move_missions FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_glow_missions_user_date ON public.glow_move_missions(user_id, completed_at DESC);
