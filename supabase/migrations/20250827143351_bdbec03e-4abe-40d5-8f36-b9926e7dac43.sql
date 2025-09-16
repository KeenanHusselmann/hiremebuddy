-- Create storage policies for kyc-photos bucket to allow uploads during signup

-- Allow unauthenticated users to upload to temp folder during signup
CREATE POLICY "Allow unauthenticated temp uploads during signup" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'kyc-photos' 
  AND (storage.foldername(name))[1] = 'temp'
);

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own KYC photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'kyc-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own KYC photos
CREATE POLICY "Users can view their own KYC photos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'kyc-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to view all KYC photos for verification
CREATE POLICY "Admins can view all KYC photos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'kyc-photos' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'admin'
  )
);

-- Allow temp folder access for unauthenticated users during signup
CREATE POLICY "Allow temp folder access during signup" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'kyc-photos' 
  AND (storage.foldername(name))[1] = 'temp'
);