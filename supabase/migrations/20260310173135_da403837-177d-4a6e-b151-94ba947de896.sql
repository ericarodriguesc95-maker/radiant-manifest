CREATE POLICY "Users can update own comments"
ON public.post_comments FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);