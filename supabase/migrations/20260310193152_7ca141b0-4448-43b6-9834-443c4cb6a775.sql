
CREATE TABLE public.app_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  how_to_use TEXT,
  icon TEXT NOT NULL DEFAULT '✨',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.app_update_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  update_id UUID NOT NULL REFERENCES public.app_updates(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, update_id)
);

ALTER TABLE public.app_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_update_reads ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read updates
CREATE POLICY "Anyone can read updates" ON public.app_updates FOR SELECT TO authenticated USING (true);

-- Users can read their own read records
CREATE POLICY "Users can read own reads" ON public.app_update_reads FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reads" ON public.app_update_reads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
