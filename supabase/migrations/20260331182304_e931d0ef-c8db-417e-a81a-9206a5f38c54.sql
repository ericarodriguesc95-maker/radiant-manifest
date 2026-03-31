
-- Create a security definer function to check conversation membership without triggering recursive RLS
CREATE OR REPLACE FUNCTION public.is_conversation_member(_user_id uuid, _conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE user_id = _user_id AND conversation_id = _conversation_id
  )
$$;

-- Fix conversation_participants SELECT policy to use security definer function
DROP POLICY IF EXISTS "Users can read participants of own conversations" ON public.conversation_participants;
CREATE POLICY "Users can read participants of own conversations"
ON public.conversation_participants
FOR SELECT
TO authenticated
USING (public.is_conversation_member(auth.uid(), conversation_id));

-- Fix conversation_participants INSERT policy to also use function
DROP POLICY IF EXISTS "Users can add participants" ON public.conversation_participants;
CREATE POLICY "Users can add participants"
ON public.conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_conversation_member(auth.uid(), conversation_id)
  OR NOT EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_participants.conversation_id = conversation_participants.conversation_id)
);

-- Fix conversations SELECT policy
DROP POLICY IF EXISTS "Users can read own conversations" ON public.conversations;
CREATE POLICY "Users can read own conversations"
ON public.conversations
FOR SELECT
TO authenticated
USING (public.is_conversation_member(auth.uid(), id));

-- Fix conversations UPDATE policy
DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
CREATE POLICY "Users can update own conversations"
ON public.conversations
FOR UPDATE
TO authenticated
USING (public.is_conversation_member(auth.uid(), id));
