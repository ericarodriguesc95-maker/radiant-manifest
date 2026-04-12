
CREATE OR REPLACE FUNCTION public.toggle_post_like(_post_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.post_likes WHERE post_id = _post_id AND user_id = _user_id
  ) INTO _exists;

  IF _exists THEN
    DELETE FROM public.post_likes WHERE post_id = _post_id AND user_id = _user_id;
    UPDATE public.community_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = _post_id;
    RETURN false;
  ELSE
    INSERT INTO public.post_likes (post_id, user_id) VALUES (_post_id, _user_id);
    UPDATE public.community_posts SET likes_count = likes_count + 1 WHERE id = _post_id;
    RETURN true;
  END IF;
END;
$$;
