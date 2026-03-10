-- Follow system
CREATE TABLE public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all follows"
  ON public.user_follows FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can follow others"
  ON public.user_follows FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.user_follows FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);

-- Add 'follow' to notifications type constraint
ALTER TABLE public.notifications DROP CONSTRAINT notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type = ANY (ARRAY['like','comment','mention','welcome','new_post','follow']));

-- Sticker packs
CREATE TABLE public.sticker_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  cover_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sticker_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read public packs"
  ON public.sticker_packs FOR SELECT TO authenticated USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create own packs"
  ON public.sticker_packs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own packs"
  ON public.sticker_packs FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own packs"
  ON public.sticker_packs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Sticker pack items
CREATE TABLE public.sticker_pack_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID NOT NULL REFERENCES public.sticker_packs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sticker_pack_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read items of visible packs"
  ON public.sticker_pack_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.sticker_packs WHERE id = pack_id AND (is_public = true OR user_id = auth.uid())));

CREATE POLICY "Pack owners can insert items"
  ON public.sticker_pack_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.sticker_packs WHERE id = pack_id AND user_id = auth.uid()));

CREATE POLICY "Pack owners can delete items"
  ON public.sticker_pack_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.sticker_packs WHERE id = pack_id AND user_id = auth.uid()));

-- Storage bucket for sticker images
INSERT INTO storage.buckets (id, name, public) VALUES ('stickers', 'stickers', true);

CREATE POLICY "Anyone can read stickers"
  ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'stickers');

CREATE POLICY "Authenticated users can upload stickers"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'stickers');

CREATE POLICY "Users can delete own stickers"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'stickers' AND (storage.foldername(name))[1] = auth.uid()::text);