
-- Add media columns to community_posts
ALTER TABLE public.community_posts 
  ADD COLUMN media_url text DEFAULT NULL,
  ADD COLUMN media_type text DEFAULT NULL;

-- Create storage bucket for community media
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-media', 'community-media', true);

-- Storage policies for community-media bucket
CREATE POLICY "Authenticated users can upload community media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'community-media');

CREATE POLICY "Anyone can view community media"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'community-media');

CREATE POLICY "Users can delete own community media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'community-media' AND (storage.foldername(name))[1] = auth.uid()::text);
