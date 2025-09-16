-- 1) Helper function to avoid recursive RLS checks
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = _user_id AND p.user_type = 'admin'::public.user_type
  );
$$;

-- 2) Tighten profiles SELECT access
-- Drop overly permissive policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Authenticated users can view profiles'
  ) THEN
    EXECUTE 'DROP POLICY "Authenticated users can view profiles" ON public.profiles';
  END IF;
END
$$;

-- Create restrictive SELECT policies
CREATE POLICY "Users can view their own profile (select)"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles (select)"
ON public.profiles
FOR SELECT
USING (public.is_admin(auth.uid()));

-- 3) Update existing admin UPDATE policy to use helper (avoid self-reference)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Admins can update any profile'
  ) THEN
    EXECUTE 'DROP POLICY "Admins can update any profile" ON public.profiles';
  END IF;
END
$$;

CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Keep existing INSERT/UPDATE (own profile) policies intact

-- 4) Replace get_safe_profiles to exclude sensitive location_text
DROP FUNCTION IF EXISTS public.get_safe_profiles(uuid[]);

CREATE OR REPLACE FUNCTION public.get_safe_profiles(profile_ids uuid[])
RETURNS TABLE(
  id uuid,
  full_name text,
  town text,
  avatar_url text,
  is_verified boolean,
  user_type public.user_type
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.full_name, p.town, p.avatar_url, p.is_verified, p.user_type
  FROM public.profiles p
  WHERE p.id = ANY(profile_ids);
END;
$$;