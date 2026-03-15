
-- Post views tracking
CREATE TABLE public.post_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  viewer_id uuid NOT NULL,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(post_id, viewer_id)
);

ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read post views" ON public.post_views
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own views" ON public.post_views
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = viewer_id);

-- Conversations for DMs
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Conversation participants
CREATE TABLE public.conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- Direct messages
CREATE TABLE public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid NOT NULL,
  text text NOT NULL,
  media_url text,
  media_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  read boolean NOT NULL DEFAULT false
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Chat rooms
CREATE TABLE public.chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text NOT NULL DEFAULT '💬',
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

-- Chat room messages
CREATE TABLE public.chat_room_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  text text NOT NULL,
  media_url text,
  media_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_room_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can read own conversations" ON public.conversations
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = id AND user_id = auth.uid())
  );

-- RLS for conversation_participants
CREATE POLICY "Users can read participants of own conversations" ON public.conversation_participants
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid())
  );

CREATE POLICY "Users can add participants" ON public.conversation_participants
  FOR INSERT TO authenticated WITH CHECK (true);

-- RLS for direct_messages
CREATE POLICY "Users can read messages in own conversations" ON public.direct_messages
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = direct_messages.conversation_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can send messages in own conversations" ON public.direct_messages
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = direct_messages.conversation_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update own messages" ON public.direct_messages
  FOR UPDATE TO authenticated USING (auth.uid() = sender_id);

-- RLS for chat_rooms (public)
CREATE POLICY "Anyone can read chat rooms" ON public.chat_rooms
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can create rooms" ON public.chat_rooms
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- RLS for chat_room_messages
CREATE POLICY "Anyone can read room messages" ON public.chat_room_messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can send room messages" ON public.chat_room_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Enable realtime for messaging
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_room_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_views;
