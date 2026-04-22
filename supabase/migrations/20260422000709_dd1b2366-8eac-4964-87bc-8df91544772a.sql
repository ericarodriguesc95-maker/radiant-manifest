-- Add preferred bible version to reading progress
ALTER TABLE public.bible_reading_progress
  ADD COLUMN IF NOT EXISTS preferred_version text NOT NULL DEFAULT 'NVI';

-- Create journey notes table (per day per user)
CREATE TABLE IF NOT EXISTS public.bible_journey_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  day integer NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, day)
);

ALTER TABLE public.bible_journey_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own journey notes"
  ON public.bible_journey_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own journey notes"
  ON public.bible_journey_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own journey notes"
  ON public.bible_journey_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own journey notes"
  ON public.bible_journey_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_bible_journey_notes_updated_at
  BEFORE UPDATE ON public.bible_journey_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();