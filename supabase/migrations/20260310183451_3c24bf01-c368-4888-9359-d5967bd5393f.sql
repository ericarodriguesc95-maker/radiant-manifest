
-- Stories table
CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  media_url TEXT,
  media_type TEXT NOT NULL DEFAULT 'text',
  text_content TEXT,
  bg_color TEXT DEFAULT '#C8A45C',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read stories" ON public.stories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own stories" ON public.stories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own stories" ON public.stories FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Story views table
CREATE TABLE public.story_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, viewer_id)
);

ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read story views" ON public.story_views FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own views" ON public.story_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = viewer_id);

-- Enable realtime for stories
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;
