CREATE POLICY "Admins can delete any post"
ON public.community_posts
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any comment"
ON public.post_comments
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));