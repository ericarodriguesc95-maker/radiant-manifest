-- Trilha de Aprendizado: progresso por nível
CREATE TABLE public.elite_journey_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  level_id integer NOT NULL,
  completed_modules text[] NOT NULL DEFAULT '{}',
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, level_id)
);

ALTER TABLE public.elite_journey_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own journey progress"
ON public.elite_journey_progress FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Diagnóstico Comportamental: arquétipo + plano de aceleração
CREATE TABLE public.elite_diagnostic_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  archetype text NOT NULL,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  acceleration_plan jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.elite_diagnostic_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own diagnostic"
ON public.elite_diagnostic_results FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Vídeos completados (para tracking de aulas)
CREATE TABLE public.elite_video_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  track_id text NOT NULL,
  video_id text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);

ALTER TABLE public.elite_video_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own video completions"
ON public.elite_video_completions FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Trigger para updated_at
CREATE TRIGGER update_elite_journey_updated_at
  BEFORE UPDATE ON public.elite_journey_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_elite_diagnostic_updated_at
  BEFORE UPDATE ON public.elite_diagnostic_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();