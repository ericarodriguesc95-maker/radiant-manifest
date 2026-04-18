-- Tabela para anotações de reflexão por módulo da Jornada Elite
CREATE TABLE public.elite_module_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  level_id INTEGER NOT NULL,
  module_id TEXT NOT NULL,
  reflection_answer TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);

ALTER TABLE public.elite_module_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own module notes"
ON public.elite_module_notes
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE TRIGGER update_elite_module_notes_updated_at
BEFORE UPDATE ON public.elite_module_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();