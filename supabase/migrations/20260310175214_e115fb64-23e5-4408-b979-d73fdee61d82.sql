CREATE TABLE public.saved_stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  url TEXT NOT NULL,
  preview_url TEXT,
  type TEXT NOT NULL CHECK (type IN ('gif', 'sticker')),
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, url)
);

ALTER TABLE public.saved_stickers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own saved stickers"
  ON public.saved_stickers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved stickers"
  ON public.saved_stickers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved stickers"
  ON public.saved_stickers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);