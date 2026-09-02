-- 1) Notifications: stop trusting client-side inserts; route through a validating RPC
DROP POLICY IF EXISTS "Users can insert notifications as themselves" ON public.notifications;

CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_post_id uuid DEFAULT NULL,
  p_comment_text text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF p_user_id IS NULL OR p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'invalid recipient';
  END IF;

  IF p_type NOT IN ('like', 'comment', 'mention', 'follow', 'new_post') THEN
    RAISE EXCEPTION 'invalid notification type';
  END IF;

  -- Truncate free text to a safe length
  IF p_comment_text IS NOT NULL AND length(p_comment_text) > 200 THEN
    p_comment_text := left(p_comment_text, 200);
  END IF;

  -- Tie interaction notifications to a real post
  IF p_type IN ('like', 'comment', 'mention', 'new_post') THEN
    IF p_post_id IS NULL OR NOT EXISTS (SELECT 1 FROM public.community_posts WHERE id = p_post_id) THEN
      RAISE EXCEPTION 'invalid post reference';
    END IF;
  END IF;

  -- Follow notifications require an actual follow relationship
  IF p_type = 'follow' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_follows
      WHERE follower_id = auth.uid() AND following_id = p_user_id
    ) THEN
      RAISE EXCEPTION 'follow relationship not found';
    END IF;
  END IF;

  INSERT INTO public.notifications (user_id, from_user_id, type, post_id, comment_text)
  VALUES (p_user_id, auth.uid(), p_type, p_post_id, p_comment_text)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE INSERT ON public.notifications FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification(uuid, text, uuid, text) TO authenticated;

-- 2) Conversations: atomic creation with participant enrollment via RPC
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

CREATE OR REPLACE FUNCTION public.create_direct_conversation(p_other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conv_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF p_other_user_id IS NULL OR p_other_user_id = auth.uid() THEN
    RAISE EXCEPTION 'invalid participant';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = p_other_user_id) THEN
    RAISE EXCEPTION 'user not found';
  END IF;

  INSERT INTO public.conversations DEFAULT VALUES
  RETURNING id INTO v_conv_id;

  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (v_conv_id, auth.uid()), (v_conv_id, p_other_user_id);

  RETURN v_conv_id;
END;
$$;

REVOKE INSERT ON public.conversations FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_direct_conversation(uuid) TO authenticated;