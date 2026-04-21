
-- Tabela de exercícios concluídos do Método Identidade Inabalável
CREATE TABLE IF NOT EXISTS public.identidade_exercicios_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pilar TEXT NOT NULL CHECK (pilar IN ('espirito','alma','corpo')),
  exercicio_key TEXT NOT NULL,
  exercicio_titulo TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  week_start DATE NOT NULL DEFAULT date_trunc('week', now())::date,
  nota TEXT
);

CREATE INDEX IF NOT EXISTS idx_identidade_log_user_week 
  ON public.identidade_exercicios_log (user_id, week_start);

ALTER TABLE public.identidade_exercicios_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own identidade log"
  ON public.identidade_exercicios_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own identidade log"
  ON public.identidade_exercicios_log FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own identidade log"
  ON public.identidade_exercicios_log FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Tabela de diagnósticos (histórico de quizzes)
CREATE TABLE IF NOT EXISTS public.identidade_diagnosticos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  espirito_score INT NOT NULL,
  alma_score INT NOT NULL,
  corpo_score INT NOT NULL,
  pilar_foco TEXT NOT NULL CHECK (pilar_foco IN ('espirito','alma','corpo')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_identidade_diag_user 
  ON public.identidade_diagnosticos (user_id, created_at DESC);

ALTER TABLE public.identidade_diagnosticos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own diagnostico"
  ON public.identidade_diagnosticos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own diagnostico"
  ON public.identidade_diagnosticos FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
