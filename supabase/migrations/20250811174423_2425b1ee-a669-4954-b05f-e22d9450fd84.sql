-- Secure profiles and set up notifications triggers

-- 1) Enable RLS on profiles and reset policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT polname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.polname);
  END LOOP;
END$$;

-- Allow authenticated users to read profiles (frontend relies on this)
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2) Public-safe view for anonymous browsing (no sensitive fields)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  town,
  avatar_url,
  is_verified,
  user_type,
  location_text
FROM public.profiles;

REVOKE ALL ON TABLE public.public_profiles FROM PUBLIC;
GRANT SELECT ON TABLE public.public_profiles TO anon, authenticated;

-- 3) Quote request notification triggers (idempotent)
DROP TRIGGER IF EXISTS trg_notify_new_quote_request ON public.quote_requests;
CREATE TRIGGER trg_notify_new_quote_request
AFTER INSERT ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_quote_request();

DROP TRIGGER IF EXISTS trg_notify_quote_response ON public.quote_requests;
CREATE TRIGGER trg_notify_quote_response
AFTER UPDATE ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_quote_response();

CREATE OR REPLACE FUNCTION public.notify_quote_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'accepted' THEN
    -- Notify provider
    PERFORM public.create_notification(
      NEW.labourer_id,
      'quote_accepted',
      'Your quote has been accepted. The client will contact you to schedule the work.',
      'quote',
      '/quote-requests/' || NEW.id
    );
    -- Notify client confirmation
    PERFORM public.create_notification(
      NEW.client_id,
      'quote_confirmed',
      'You accepted the provider quote. You can coordinate next steps.',
      'quote',
      '/quote-requests/' || NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_quote_accepted ON public.quote_requests;
CREATE TRIGGER trg_notify_quote_accepted
AFTER UPDATE ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_quote_accepted();