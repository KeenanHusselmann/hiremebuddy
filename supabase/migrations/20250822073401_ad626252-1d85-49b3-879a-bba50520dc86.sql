-- Fix the profile insertion policy that allows NULL auth.uid()
-- This could potentially allow unauthorized access

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create a more secure policy that only allows authenticated users
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Also ensure we have proper security definer functions for profile queries
-- This prevents potential RLS bypass issues

CREATE OR REPLACE FUNCTION public.get_user_profile_id()
RETURNS UUID AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Update the quote_requests policies to use more secure profile lookups
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Users can update their own quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Clients can create quote requests" ON public.quote_requests;

-- Create more secure policies using the security definer function
CREATE POLICY "Users can view their own quote requests" 
ON public.quote_requests 
FOR SELECT 
USING (
  client_id = public.get_user_profile_id() OR 
  labourer_id = public.get_user_profile_id()
);

CREATE POLICY "Users can update their own quote requests" 
ON public.quote_requests 
FOR UPDATE 
USING (
  client_id = public.get_user_profile_id() OR 
  labourer_id = public.get_user_profile_id()
);

CREATE POLICY "Clients can create quote requests" 
ON public.quote_requests 
FOR INSERT 
WITH CHECK (
  client_id = public.get_user_profile_id() AND 
  auth.uid() IS NOT NULL
);