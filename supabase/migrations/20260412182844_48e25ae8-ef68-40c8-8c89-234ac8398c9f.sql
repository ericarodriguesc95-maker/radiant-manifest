
-- 1. Fix community_posts UPDATE policy
DROP POLICY IF EXISTS "Anyone can update likes count" ON public.community_posts;

CREATE POLICY "Users can update own posts"
ON public.community_posts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Fix notifications INSERT policy
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;

CREATE POLICY "Users can insert notifications as themselves"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = from_user_id);

-- 3. Explicit deny policies on user_roles for safety
CREATE POLICY "No authenticated insert on user_roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "No authenticated update on user_roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "No authenticated delete on user_roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (false);

-- 4. Fix storage: community-media INSERT ownership
DROP POLICY IF EXISTS "Authenticated users can upload community media" ON storage.objects;
CREATE POLICY "Authenticated users can upload community media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 5. Fix storage: stickers INSERT ownership
DROP POLICY IF EXISTS "Authenticated users can upload stickers" ON storage.objects;
CREATE POLICY "Authenticated users can upload stickers"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'stickers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 6. Fix storage: health-media UPDATE policy
CREATE POLICY "Users can update own health media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'health-media' AND auth.uid()::text = (storage.foldername(name))[1]);
