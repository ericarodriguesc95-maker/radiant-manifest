
-- Fix health-media SELECT policy to require ownership
DROP POLICY IF EXISTS "Users can view own health media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view health media" ON storage.objects;

-- Find and drop any existing SELECT policy for health-media
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
    AND policyname ILIKE '%health%' AND cmd = 'r'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can view own health media"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'health-media' AND auth.uid()::text = (storage.foldername(name))[1]);
