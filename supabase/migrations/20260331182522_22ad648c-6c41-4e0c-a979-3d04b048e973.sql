
-- Create a security definer function to check if a conversation has any participants
CREATE OR REPLACE FUNCTION public.conversation_has_participants(_conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = _conversation_id
  )
$$;

-- Fix INSERT policy: allow if member OR if conversation has no participants yet
DROP POLICY IF EXISTS "Users can add participants" ON public.conversation_participants;
CREATE POLICY "Users can add participants"
ON public.conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_conversation_member(auth.uid(), conversation_id)
  OR NOT public.conversation_has_participants(conversation_id)
);
