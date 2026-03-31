
-- Fix the INSERT policy - the NOT EXISTS subquery was self-referencing
DROP POLICY IF EXISTS "Users can add participants" ON public.conversation_participants;
CREATE POLICY "Users can add participants"
ON public.conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_conversation_member(auth.uid(), conversation_id)
  OR NOT public.is_conversation_member(auth.uid(), conversation_id) AND NOT EXISTS (
    SELECT 1 FROM public.conversation_participants cp2
    WHERE cp2.conversation_id = conversation_participants.conversation_id
  )
);
