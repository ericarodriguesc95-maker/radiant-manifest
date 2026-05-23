-- Restrict challenge_participants reads to owner; expose counts via SECURITY DEFINER RPC
DROP POLICY IF EXISTS "Anyone can view participant counts" ON public.challenge_participants;
CREATE POLICY "Users read own participation"
  ON public.challenge_participants FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.get_challenge_participant_counts()
RETURNS TABLE(challenge_id text, count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT challenge_id, count(*)::bigint
  FROM public.challenge_participants
  GROUP BY challenge_id;
$$;
REVOKE EXECUTE ON FUNCTION public.get_challenge_participant_counts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_challenge_participant_counts() TO authenticated;

-- Restrict post_views reads to the viewer themselves or to the post owner
DROP POLICY IF EXISTS "Anyone can read post views" ON public.post_views;
CREATE POLICY "Viewer or post owner can read post views"
  ON public.post_views FOR SELECT TO authenticated
  USING (
    auth.uid() = viewer_id
    OR EXISTS (
      SELECT 1 FROM public.community_posts cp
      WHERE cp.id = post_views.post_id AND cp.user_id = auth.uid()
    )
  );

-- Restrict story_views reads to the viewer themselves or to the story owner
DROP POLICY IF EXISTS "Anyone can read story views" ON public.story_views;
CREATE POLICY "Viewer or story owner can read story views"
  ON public.story_views FOR SELECT TO authenticated
  USING (
    auth.uid() = viewer_id
    OR EXISTS (
      SELECT 1 FROM public.stories s
      WHERE s.id = story_views.story_id AND s.user_id = auth.uid()
    )
  );