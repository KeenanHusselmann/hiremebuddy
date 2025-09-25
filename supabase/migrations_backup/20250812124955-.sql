-- Allow admin console (no auth context) to change profile user_type/is_verified
CREATE OR REPLACE FUNCTION public.enforce_profile_update_restrictions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF (NEW.user_type IS DISTINCT FROM OLD.user_type OR NEW.is_verified IS DISTINCT FROM OLD.is_verified) THEN
    -- If called outside PostgREST/auth context (e.g., SQL Editor/Table Editor), auth.uid() is NULL
    -- In that case, allow the operation (intended for admins/service role)
    IF auth.uid() IS NULL THEN
      RETURN NEW;
    END IF;

    -- For API calls, enforce admin check
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
        AND admin_profile.user_type = 'admin'
    ) THEN
      RAISE EXCEPTION 'Only admins can modify user_type or verification status';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;