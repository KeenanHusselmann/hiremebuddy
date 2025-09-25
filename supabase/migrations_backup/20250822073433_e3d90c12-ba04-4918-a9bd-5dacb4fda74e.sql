-- Fix the search path for the security definer function
CREATE OR REPLACE FUNCTION public.get_user_profile_id()
RETURNS UUID 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path TO 'public'
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid();
$$;