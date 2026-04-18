CREATE TABLE public.elite_video_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id TEXT NOT NULL,
  video_id TEXT NOT NULL UNIQUE,
  youtube_id TEXT NOT NULL,
  youtube_url TEXT,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.elite_video_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read overrides"
ON public.elite_video_overrides
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert overrides"
ON public.elite_video_overrides
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update overrides"
ON public.elite_video_overrides
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete overrides"
ON public.elite_video_overrides
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_elite_video_overrides_updated_at
BEFORE UPDATE ON public.elite_video_overrides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_elite_video_overrides_video_id ON public.elite_video_overrides(video_id);