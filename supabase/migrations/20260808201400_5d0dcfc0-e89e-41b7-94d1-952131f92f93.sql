CREATE OR REPLACE FUNCTION public.get_leaderboard_streaks()
 RETURNS TABLE(user_id uuid, display_name text, avatar_url text, streak integer)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH distinct_users AS (
    SELECT DISTINCT dc.user_id AS uid
    FROM public.daily_completions dc
    WHERE dc.all_completed = true
  ),
  streaks AS (
    SELECT du.uid, public.calculate_streak(du.uid) AS streak
    FROM distinct_users du
  )
  SELECT
    s.uid,
    p.display_name,
    p.avatar_url,
    s.streak
  FROM streaks s
  LEFT JOIN public.profiles p ON p.user_id = s.uid
  WHERE s.streak > 0
  ORDER BY s.streak DESC
  LIMIT 50;
END;
$function$;