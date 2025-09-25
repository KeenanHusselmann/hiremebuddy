-- Create storage policies for ID document uploads during signup
-- Allow unauthenticated users to upload ID documents during signup
CREATE POLICY "Allow ID document uploads during signup"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'profile-images' 
  AND (storage.foldername(name))[1] = 'id-documents'
);

-- Allow authenticated users to upload ID documents
CREATE POLICY "Allow authenticated users to upload ID documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' 
  AND (storage.foldername(name))[1] = 'id-documents'
);

-- Allow public access to view uploaded ID documents (for verification purposes)
CREATE POLICY "Allow viewing ID documents"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'profile-images' 
  AND (storage.foldername(name))[1] = 'id-documents'
);