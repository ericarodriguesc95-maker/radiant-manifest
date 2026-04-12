
DO $$
BEGIN
  -- Remove direct_messages from realtime if it's there
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.direct_messages;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  
  -- Remove notifications from realtime if it's there
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.notifications;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  
  -- Remove activity_log from realtime if it's there
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.activity_log;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;
