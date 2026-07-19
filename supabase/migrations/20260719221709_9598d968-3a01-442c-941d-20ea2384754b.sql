
CREATE TABLE public.reminder_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('received','snoozed','completed')),
  snooze_hours INTEGER,
  source TEXT NOT NULL DEFAULT 'scheduled',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reminder_events_user_created ON public.reminder_events(user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminder_events TO authenticated;
GRANT ALL ON public.reminder_events TO service_role;

ALTER TABLE public.reminder_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own reminder events"
ON public.reminder_events
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
