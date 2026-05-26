-- Chat room messages: allow authors to update/delete, admins to delete
CREATE POLICY "Authors can update their messages"
ON public.chat_room_messages FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can delete their messages"
ON public.chat_room_messages FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any message"
ON public.chat_room_messages FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Chat rooms: allow creators to update/delete, admins override
CREATE POLICY "Creators can update their rooms"
ON public.chat_rooms FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can delete their rooms"
ON public.chat_rooms FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Admins can update any room"
ON public.chat_rooms FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any room"
ON public.chat_rooms FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Stories: allow authors to update their own stories
CREATE POLICY "Authors can update their stories"
ON public.stories FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);