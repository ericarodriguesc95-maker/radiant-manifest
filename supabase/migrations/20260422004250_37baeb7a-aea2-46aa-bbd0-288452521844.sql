
-- Tabela para histórico de conversas com a Mestra Bíblica IA
CREATE TABLE public.bible_study_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day INTEGER NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índice para buscas rápidas por usuário e dia
CREATE INDEX idx_bible_study_chat_user_day ON public.bible_study_chat_messages(user_id, day, created_at);

-- Habilita RLS
ALTER TABLE public.bible_study_chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas: cada usuária só acessa o próprio histórico
CREATE POLICY "Users can view own chat messages"
ON public.bible_study_chat_messages
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat messages"
ON public.bible_study_chat_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages"
ON public.bible_study_chat_messages
FOR DELETE
USING (auth.uid() = user_id);
