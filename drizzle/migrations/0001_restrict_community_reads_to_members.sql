CREATE OR REPLACE FUNCTION public.is_member(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _user_id IS NOT NULL AND (public.has_active_subscription(_user_id) OR public.has_role(_user_id, 'admin'))
$$;
REVOKE EXECUTE ON FUNCTION public.is_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_member(uuid) TO authenticated;

DROP POLICY IF EXISTS "Anyone can read likes" ON public.post_likes;
CREATE POLICY "Members can read likes" ON public.post_likes FOR SELECT TO authenticated USING (public.is_member(auth.uid()));
DROP POLICY IF EXISTS "Authenticated can view birthday posts" ON public.birthday_posts;
CREATE POLICY "Members can view birthday posts" ON public.birthday_posts FOR SELECT TO authenticated USING (public.is_member(auth.uid()));
DROP POLICY IF EXISTS "Daily devotionals readable by all" ON public.daily_devotionals;
CREATE POLICY "Members can read devotionals" ON public.daily_devotionals FOR SELECT TO authenticated USING (public.is_member(auth.uid()));
DROP POLICY IF EXISTS "Anyone can read stories" ON public.stories;
CREATE POLICY "Members can read stories" ON public.stories FOR SELECT TO authenticated USING (public.is_member(auth.uid()) OR user_id = auth.uid());
DROP POLICY IF EXISTS "Users can read all follows" ON public.user_follows;
CREATE POLICY "Members can read follows" ON public.user_follows FOR SELECT TO authenticated USING (public.is_member(auth.uid()) OR follower_id = auth.uid() OR following_id = auth.uid());
DROP POLICY IF EXISTS "Anyone can read room messages" ON public.chat_room_messages;
CREATE POLICY "Members can read room messages" ON public.chat_room_messages FOR SELECT TO authenticated USING (public.is_member(auth.uid()));
DROP POLICY IF EXISTS "Anyone can read story reactions" ON public.story_reactions;
CREATE POLICY "Members can read story reactions" ON public.story_reactions FOR SELECT TO authenticated USING (public.is_member(auth.uid()) OR user_id = auth.uid());
DROP POLICY IF EXISTS "Anyone can read chat rooms" ON public.chat_rooms;
CREATE POLICY "Members can read chat rooms" ON public.chat_rooms FOR SELECT TO authenticated USING (public.is_member(auth.uid()));
DROP POLICY IF EXISTS "Anyone can read story comments" ON public.story_comments;
CREATE POLICY "Members can read story comments" ON public.story_comments FOR SELECT TO authenticated USING (public.is_member(auth.uid()) OR user_id = auth.uid());
DROP POLICY IF EXISTS "Anyone authenticated can view checkpoints" ON public.checkpoint_definitions;
CREATE POLICY "Members can view checkpoints" ON public.checkpoint_definitions FOR SELECT TO authenticated USING (public.is_member(auth.uid()));
DROP POLICY IF EXISTS "Anyone authenticated can read overrides" ON public.elite_video_overrides;
CREATE POLICY "Members can read overrides" ON public.elite_video_overrides FOR SELECT TO authenticated USING (public.is_member(auth.uid()));
DROP POLICY IF EXISTS "Anyone can read posts" ON public.community_posts;
CREATE POLICY "Members can read posts" ON public.community_posts FOR SELECT TO authenticated USING (public.is_member(auth.uid()) OR user_id = auth.uid());
DROP POLICY IF EXISTS "Anyone can read comments" ON public.post_comments;
CREATE POLICY "Members can read comments" ON public.post_comments FOR SELECT TO authenticated USING (public.is_member(auth.uid()) OR user_id = auth.uid());
DROP POLICY IF EXISTS "Anyone can read updates" ON public.app_updates;
CREATE POLICY "Members can read updates" ON public.app_updates FOR SELECT TO authenticated USING (public.is_member(auth.uid()));

-- Storage: public buckets serve files by URL without a SELECT policy; stop file listing
DROP POLICY IF EXISTS "Anyone can read stickers" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view community media" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Users can read own avatar files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);