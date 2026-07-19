
-- 1. checkpoint_definitions
CREATE TABLE public.checkpoint_definitions (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '✨',
  points INTEGER NOT NULL DEFAULT 5,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.checkpoint_definitions TO authenticated;
GRANT ALL ON public.checkpoint_definitions TO service_role;

ALTER TABLE public.checkpoint_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view checkpoints"
  ON public.checkpoint_definitions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert checkpoints"
  ON public.checkpoint_definitions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update checkpoints"
  ON public.checkpoint_definitions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete checkpoints"
  ON public.checkpoint_definitions FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_checkpoint_definitions_updated_at
  BEFORE UPDATE ON public.checkpoint_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed
INSERT INTO public.checkpoint_definitions (key, label, emoji, points, sort_order) VALUES
  ('post_do_dia', 'Fazer um post por dia', '📸', 15, 10),
  ('tempo_estudo', 'Tempo de estudo', '📚', 10, 20),
  ('nova_venda', 'Nova venda', '💰', 5, 30),
  ('conexao_natureza', 'Conexão com a natureza', '🌿', 10, 40),
  ('reduzir_redes', 'Reduzir tempo de redes sociais', '📵', 15, 50),
  ('cafe_presenca', 'Café da manhã com presença', '☕', 5, 60),
  ('desfrute_intencional', 'Desfrute intencional', '🕯️', 8, 70),
  ('escrita_matinal', 'Escrita matinal', '✍️', 5, 80),
  ('movimento_corpo', 'Movimentar o corpo', '🧘‍♀️', 10, 90),
  ('leitura_biblica', 'Leitura bíblica / devocional', '📖', 8, 100),
  ('gratidao_diaria', 'Anotar 3 gratidões', '🙏', 5, 110),
  ('hidratacao', 'Hidratação completa', '💧', 5, 120),
  ('ato_generosidade', 'Ato de generosidade', '💛', 8, 130),
  ('leitura_diaria', 'Leitura diária 10 pág', '📄', 8, 140),
  ('skin_care', 'Skin Care', '🧴', 8, 150),
  ('podcast', 'Escutar um podcast', '🎧', 10, 160),
  ('video_youtube', 'Vídeo no YouTube para conhecimento', '▶️', 10, 170),
  ('oracao_diaria', 'Oração diária', '🛐', 15, 180),
  ('tomar_cha', 'Tomar um chá', '🍵', 8, 190),
  ('suplemento_vitamina', 'Tomar suplemento/vitamina', '💊', 10, 200),
  ('meditacao_diaria', 'Meditação diária', '🧘', 10, 210);

-- 2. skin_tone in profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skin_tone TEXT;
