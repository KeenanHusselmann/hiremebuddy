-- Fix the search path issue for the function
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
  FROM public.profiles 
  WHERE user_id = auth.uid() AND user_type = 'admin';
  
  IF current_user_profile IS NULL THEN
    RAISE EXCEPTION 'Only admins can update verification status';
  END IF;
  
  -- Update the profile
  UPDATE public.profiles 
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