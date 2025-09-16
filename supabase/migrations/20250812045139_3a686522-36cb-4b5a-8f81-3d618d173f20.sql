-- Recreate get_safe_profiles with location_text included
DROP FUNCTION IF EXISTS public.get_safe_profiles(profile_ids uuid[]);

CREATE FUNCTION public.get_safe_profiles(profile_ids uuid[])
RETURNS TABLE(
  id uuid,
  full_name text,
  town text,
  location_text text,
  avatar_url text,
  is_verified boolean,
  user_type public.user_type
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.full_name, p.town, p.location_text, p.avatar_url, p.is_verified, p.user_type
  FROM public.profiles p
  WHERE p.id = ANY(profile_ids);
END;
$$;