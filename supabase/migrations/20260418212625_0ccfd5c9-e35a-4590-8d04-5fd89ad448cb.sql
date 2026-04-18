-- NPS Responses
CREATE TABLE public.nps_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.nps_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own nps" ON public.nps_responses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own nps" ON public.nps_responses
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all nps" ON public.nps_responses
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Suggestions
CREATE TABLE public.suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL DEFAULT 'geral',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'nova',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own suggestions" ON public.suggestions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own suggestions" ON public.suggestions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all suggestions" ON public.suggestions
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update suggestions" ON public.suggestions
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users delete own suggestions" ON public.suggestions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_suggestions_updated_at
  BEFORE UPDATE ON public.suggestions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Suggestion Replies (thread)
CREATE TABLE public.suggestion_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  suggestion_id UUID NOT NULL REFERENCES public.suggestions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  is_admin_reply BOOLEAN NOT NULL DEFAULT false,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.suggestion_replies ENABLE ROW LEVEL SECURITY;

-- Author of suggestion can read replies on their own suggestions; admins read all
CREATE POLICY "Owners read replies on own suggestions" ON public.suggestion_replies
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.suggestions s WHERE s.id = suggestion_id AND s.user_id = auth.uid())
  );
CREATE POLICY "Admins read all replies" ON public.suggestion_replies
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Owner can reply on own suggestion (continue thread); Admins can reply on any
CREATE POLICY "Owner can reply on own suggestion" ON public.suggestion_replies
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = author_id
    AND is_admin_reply = false
    AND EXISTS (SELECT 1 FROM public.suggestions s WHERE s.id = suggestion_id AND s.user_id = auth.uid())
  );
CREATE POLICY "Admins can reply" ON public.suggestion_replies
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = author_id
    AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE INDEX idx_suggestion_replies_suggestion ON public.suggestion_replies(suggestion_id, created_at);
CREATE INDEX idx_suggestions_user ON public.suggestions(user_id, created_at DESC);
CREATE INDEX idx_suggestions_status ON public.suggestions(status, created_at DESC);
CREATE INDEX idx_nps_user ON public.nps_responses(user_id, created_at DESC);