
-- Allow authenticated users to update likes_count on any post
CREATE POLICY "Anyone can update likes count"
  ON public.community_posts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
