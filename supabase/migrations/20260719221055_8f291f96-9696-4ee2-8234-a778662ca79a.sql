
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS checkpoint_reminder_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS checkpoint_reminder_times text[] NOT NULL DEFAULT ARRAY['09:00','15:00','21:00'];

CREATE OR REPLACE FUNCTION public.get_daily_checkpoint_leaderboard(_day date DEFAULT CURRENT_DATE)
RETURNS TABLE(user_id uuid, display_name text, avatar_url text, points bigint, tasks_done bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    dc.user_id,
    p.display_name,
    p.avatar_url,
    COALESCE(SUM(dc.points),0)::bigint AS points,
    COUNT(*)::bigint AS tasks_done
  FROM public.daily_checkpoints dc
  LEFT JOIN public.profiles p ON p.user_id = dc.user_id
  WHERE dc.completion_date = _day
    AND p.display_name IS NOT NULL
  GROUP BY dc.user_id, p.display_name, p.avatar_url
  ORDER BY points DESC, tasks_done DESC
  LIMIT 100;
$$;

GRANT EXECUTE ON FUNCTION public.get_daily_checkpoint_leaderboard(date) TO authenticated;

ALTER TABLE public.daily_checkpoints REPLICA IDENTITY FULL;
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_checkpoints';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
