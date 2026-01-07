-- Create storage buckets for model files and images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('model-files', 'model-files', false, 52428800, ARRAY['application/octet-stream', 'model/stl', 'model/step', 'model/3mf', 'model/obj']),
  ('model-images', 'model-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload files to own models" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files for published models or own models" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own model files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view model images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload images to own models" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own model images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Storage policies for model-files bucket (private, authenticated access)
CREATE POLICY "Users can upload files to own models"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'model-files'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view files for published models or own models"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'model-files'
    AND (
      auth.role() = 'authenticated'
      AND EXISTS (
        SELECT 1 FROM models
        WHERE models.id::text = (storage.foldername(name))[1]
        AND (models.is_published = true OR models.author_id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can delete own model files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'model-files'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM models
      WHERE models.id::text = (storage.foldername(name))[1]
      AND models.author_id = auth.uid()
    )
  );

-- Storage policies for model-images bucket (public read, authenticated write)
CREATE POLICY "Anyone can view model images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'model-images');

CREATE POLICY "Users can upload images to own models"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'model-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own model images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'model-images'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM models
      WHERE models.id::text = (storage.foldername(name))[1]
      AND models.author_id = auth.uid()
    )
  );

-- Storage policies for avatars bucket (public read, authenticated write own)
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
