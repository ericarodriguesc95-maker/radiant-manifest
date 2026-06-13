
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'post',
  ADD COLUMN IF NOT EXISTS objetivos TEXT;

CREATE INDEX IF NOT EXISTS community_posts_kind_idx ON public.community_posts(kind, created_at DESC);

CREATE OR REPLACE FUNCTION public.get_monthly_ranking(_month_start DATE)
RETURNS TABLE(user_id UUID, display_name TEXT, avatar_url TEXT, points BIGINT, posts_count BIGINT, comments_count BIGINT, likes_received BIGINT, likes_given BIGINT)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _start TIMESTAMPTZ := _month_start::timestamptz;
  _end   TIMESTAMPTZ := (_month_start + INTERVAL '1 month')::timestamptz;
BEGIN
  RETURN QUERY
  WITH posts AS (
    SELECT cp.user_id, COUNT(*)::bigint AS c
    FROM public.community_posts cp
    WHERE cp.created_at >= _start AND cp.created_at < _end
    GROUP BY cp.user_id
  ),
  comments AS (
    SELECT pc.user_id, COUNT(*)::bigint AS c
    FROM public.post_comments pc
    WHERE pc.created_at >= _start AND pc.created_at < _end
    GROUP BY pc.user_id
  ),
  likes_recv AS (
    SELECT cp.user_id, COUNT(*)::bigint AS c
    FROM public.post_likes pl
    JOIN public.community_posts cp ON cp.id = pl.post_id
    WHERE pl.created_at >= _start AND pl.created_at < _end
    GROUP BY cp.user_id
  ),
  likes_given AS (
    SELECT pl.user_id, COUNT(*)::bigint AS c
    FROM public.post_likes pl
    WHERE pl.created_at >= _start AND pl.created_at < _end
    GROUP BY pl.user_id
  ),
  all_users AS (
    SELECT user_id FROM posts
    UNION SELECT user_id FROM comments
    UNION SELECT user_id FROM likes_recv
    UNION SELECT user_id FROM likes_given
  )
  SELECT
    au.user_id,
    p.display_name,
    p.avatar_url,
    (COALESCE(po.c,0)*10 + COALESCE(co.c,0)*5 + COALESCE(lr.c,0)*2 + COALESCE(lg.c,0)*2)::bigint AS points,
    COALESCE(po.c,0) AS posts_count,
    COALESCE(co.c,0) AS comments_count,
    COALESCE(lr.c,0) AS likes_received,
    COALESCE(lg.c,0) AS likes_given
  FROM all_users au
  LEFT JOIN public.profiles p ON p.user_id = au.user_id
  LEFT JOIN posts po ON po.user_id = au.user_id
  LEFT JOIN comments co ON co.user_id = au.user_id
  LEFT JOIN likes_recv lr ON lr.user_id = au.user_id
  LEFT JOIN likes_given lg ON lg.user_id = au.user_id
  WHERE p.display_name IS NOT NULL
  ORDER BY points DESC
  LIMIT 50;
END;
$$;
