
-- Add age and sex to health_profiles for TMB calculation
ALTER TABLE public.health_profiles ADD COLUMN IF NOT EXISTS age integer;
ALTER TABLE public.health_profiles ADD COLUMN IF NOT EXISTS sex text NOT NULL DEFAULT 'feminino';
ALTER TABLE public.health_profiles ADD COLUMN IF NOT EXISTS activity_level text NOT NULL DEFAULT 'moderado';

-- Add photo_url to diet_entries
ALTER TABLE public.diet_entries ADD COLUMN IF NOT EXISTS photo_url text;

-- Add photo_url to weight_records
ALTER TABLE public.weight_records ADD COLUMN IF NOT EXISTS photo_url text;

-- Create health-media storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('health-media', 'health-media', true) ON CONFLICT (id) DO NOTHING;

-- Storage RLS: users can upload their own files
CREATE POLICY "Users can upload health media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'health-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can read health media" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'health-media');

CREATE POLICY "Users can delete own health media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'health-media' AND (storage.foldername(name))[1] = auth.uid()::text);
