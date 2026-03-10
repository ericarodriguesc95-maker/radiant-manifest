
CREATE TABLE public.diary_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Sem título',
  content TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#C8A45C',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.diary_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notes" ON public.diary_notes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON public.diary_notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.diary_notes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.diary_notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_diary_notes_updated_at BEFORE UPDATE ON public.diary_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
