CREATE OR REPLACE FUNCTION public.get_monthly_top_active(_month_start date)
RETURNS TABLE(
  user_id uuid,
  display_name text,
  avatar_url text,
  actions_count bigint,
  active_days bigint,
  last_active timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _start TIMESTAMPTZ := _month_start::timestamptz;
  _end   TIMESTAMPTZ := (_month_start + INTERVAL '1 month')::timestamptz;
BEGIN
  RETURN QUERY
  WITH agg AS (
    SELECT
      al.user_id,
      COUNT(*)::bigint AS actions_count,
      COUNT(DISTINCT (al.created_at AT TIME ZONE 'America/Sao_Paulo')::date)::bigint AS active_days,
      MAX(al.created_at) AS last_active
    FROM public.activity_log al
    WHERE al.created_at >= _start AND al.created_at < _end
    GROUP BY al.user_id
  )
  SELECT
    a.user_id,
    p.display_name,
    p.avatar_url,
    a.actions_count,
    a.active_days,
    a.last_active
  FROM agg a
  LEFT JOIN public.profiles p ON p.user_id = a.user_id
  WHERE p.display_name IS NOT NULL
  ORDER BY a.actions_count DESC, a.active_days DESC
  LIMIT 50;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_monthly_top_active(date) TO authenticated;