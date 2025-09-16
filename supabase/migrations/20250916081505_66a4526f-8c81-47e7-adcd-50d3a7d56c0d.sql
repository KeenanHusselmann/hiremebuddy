-- Create new function to update verification status in new table structure
CREATE OR REPLACE FUNCTION public.update_verification_documents_status(
  verification_id uuid,
  new_status text,
  admin_notes text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_profile RECORD;
BEGIN
  -- Check if current user is admin
  SELECT * INTO current_user_profile 
  FROM public.profiles 
  WHERE user_id = auth.uid() AND user_type = 'admin';
  
  IF current_user_profile IS NULL THEN
    RAISE EXCEPTION 'Only admins can update verification status';
  END IF;
  
  -- Update the verification document
  UPDATE public.verification_documents 
  SET 
    verification_status = new_status,
    verification_notes = admin_notes,
    verified_at = CASE WHEN new_status = 'approved' THEN now() ELSE NULL END,
    verified_by = CASE WHEN new_status = 'approved' THEN auth.uid() ELSE NULL END,
    updated_at = now()
  WHERE id = verification_id;
  
  RETURN true;
END;
$$;