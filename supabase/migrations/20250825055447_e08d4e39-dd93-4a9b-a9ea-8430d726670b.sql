-- Add field for back of ID document
ALTER TABLE public.profiles 
ADD COLUMN id_document_back_image_path TEXT;

-- Add verification status and admin notes fields
ALTER TABLE public.profiles 
ADD COLUMN verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN verification_notes TEXT,
ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN verified_by UUID REFERENCES auth.users(id);

-- Create function for admin verification actions
CREATE OR REPLACE FUNCTION public.update_verification_status(
  profile_id UUID,
  new_status TEXT,
  admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_profile RECORD;
BEGIN
  -- Check if current user is admin
  SELECT * INTO current_user_profile 
  FROM profiles 
  WHERE user_id = auth.uid() AND user_type = 'admin';
  
  IF current_user_profile IS NULL THEN
    RAISE EXCEPTION 'Only admins can update verification status';
  END IF;
  
  -- Update the profile
  UPDATE profiles 
  SET 
    verification_status = new_status,
    verification_notes = admin_notes,
    verified_at = CASE WHEN new_status = 'approved' THEN now() ELSE NULL END,
    verified_by = CASE WHEN new_status = 'approved' THEN auth.uid() ELSE NULL END,
    is_verified = CASE WHEN new_status = 'approved' THEN true ELSE false END,
    updated_at = now()
  WHERE id = profile_id;
  
  RETURN true;
END;
$$;

-- Create view for admin to see pending verifications
CREATE OR REPLACE VIEW public.pending_verifications AS
SELECT 
  p.id,
  p.full_name,
  p.contact_number,
  p.location_text,
  p.id_document_image_path,
  p.id_document_back_image_path,
  p.selfie_image_path,
  p.verification_status,
  p.verification_notes,
  p.created_at,
  p.user_type
FROM profiles p
WHERE p.user_type IN ('labourer', 'both') 
AND p.verification_status = 'pending'
AND p.id_document_image_path IS NOT NULL
ORDER BY p.created_at DESC;

-- Grant access to admins only
GRANT SELECT ON public.pending_verifications TO authenticated;

-- Create RLS policy for the view
CREATE POLICY "Only admins can view pending verifications"
ON public.pending_verifications
FOR SELECT
USING (is_admin(auth.uid()));