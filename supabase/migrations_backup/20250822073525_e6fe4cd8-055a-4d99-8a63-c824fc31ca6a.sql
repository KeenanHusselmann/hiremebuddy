-- Make the quote_requests policies more explicit and secure
-- Drop and recreate with stronger authentication checks

DROP POLICY IF EXISTS "Users can view their own quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Users can update their own quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Clients can create quote requests" ON public.quote_requests;

-- Create highly secure policies that explicitly check authentication
CREATE POLICY "Users can view their own quote requests" 
ON public.quote_requests 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    client_id = public.get_user_profile_id() OR 
    labourer_id = public.get_user_profile_id()
  )
);

CREATE POLICY "Users can update their own quote requests" 
ON public.quote_requests 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    client_id = public.get_user_profile_id() OR 
    labourer_id = public.get_user_profile_id()
  )
);

CREATE POLICY "Clients can create quote requests" 
ON public.quote_requests 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND
  client_id = public.get_user_profile_id() AND
  client_id IS NOT NULL
);

-- Explicitly deny all other access
CREATE POLICY "Deny anonymous access to quote requests"
ON public.quote_requests
FOR ALL
TO anon
USING (false);