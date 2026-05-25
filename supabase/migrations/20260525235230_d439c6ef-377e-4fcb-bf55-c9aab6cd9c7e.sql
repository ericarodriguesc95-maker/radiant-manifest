
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='conversation_participants' AND cmd='INSERT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.conversation_participants', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can add themselves to new conversations"
ON public.conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (
    public.is_conversation_member(auth.uid(), conversation_id)
    OR NOT public.conversation_has_participants(conversation_id)
  )
);
