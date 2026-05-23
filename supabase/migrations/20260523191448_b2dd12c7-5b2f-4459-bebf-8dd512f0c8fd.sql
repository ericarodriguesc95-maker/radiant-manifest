
-- 1. Remove broad read policy on daily_completions
DROP POLICY IF EXISTS "Anyone can read completions for leaderboard" ON public.daily_completions;

-- 2. Create security definer RPC for leaderboard with aggregated streak data
CREATE OR REPLACE FUNCTION public.get_leaderboard_streaks()
RETURNS TABLE(user_id uuid, display_name text, avatar_url text, streak integer)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH user_dates AS (
    SELECT dc.user_id, dc.completion_date
    FROM public.daily_completions dc
    WHERE dc.all_completed = true
  ),
  streaks AS (
    SELECT
      ud.user_id,
      public.calculate_streak(ud.user_id) AS streak
    FROM (SELECT DISTINCT user_id FROM user_dates) ud
  )
  SELECT
    s.user_id,
    p.display_name,
    p.avatar_url,
    s.streak
  FROM streaks s
  LEFT JOIN public.profiles p ON p.user_id = s.user_id
  WHERE s.streak > 0
  ORDER BY s.streak DESC
  LIMIT 50;
END;
$$;

-- 3. Remove post_views from realtime publication to prevent viewer identity leakage
ALTER PUBLICATION supabase_realtime DROP TABLE public.post_views;
