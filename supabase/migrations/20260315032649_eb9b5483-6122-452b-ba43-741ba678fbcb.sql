
-- Fix overly permissive policies
DROP POLICY "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY "Users can add participants" ON public.conversation_participants;
CREATE POLICY "Users can add participants" ON public.conversation_participants
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() IN (SELECT cp.user_id FROM public.conversation_participants cp WHERE cp.conversation_id = conversation_participants.conversation_id)
    OR NOT EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversation_participants.conversation_id)
  );
