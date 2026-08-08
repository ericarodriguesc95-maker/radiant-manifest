CREATE TABLE public.bible_highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  verse_text TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'gold',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, book, chapter, verse)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bible_highlights TO authenticated;
GRANT ALL ON public.bible_highlights TO service_role;

ALTER TABLE public.bible_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own highlights"
ON public.bible_highlights FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own highlights"
ON public.bible_highlights FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own highlights"
ON public.bible_highlights FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own highlights"
ON public.bible_highlights FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_bible_highlights_user_created ON public.bible_highlights (user_id, created_at DESC);

CREATE TRIGGER update_bible_highlights_updated_at
BEFORE UPDATE ON public.bible_highlights
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();