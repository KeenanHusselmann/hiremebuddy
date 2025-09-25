-- Update the handle_new_user function to handle RLS properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, user_type, contact_number, location_text)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'user_type' = 'labourer' THEN 'labourer'::public.user_type
      WHEN NEW.raw_user_meta_data ->> 'user_type' = 'client' THEN 'client'::public.user_type
      WHEN NEW.raw_user_meta_data ->> 'user_type' = 'both' THEN 'both'::public.user_type
      ELSE 'client'::public.user_type
    END,
    NEW.raw_user_meta_data ->> 'contact_number',
    COALESCE(NEW.raw_user_meta_data ->> 'location_text', 'Windhoek, Namibia')
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Update the RLS policy to allow the trigger to work properly
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create a more permissive INSERT policy that allows both authenticated users and the trigger
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  -- Allow if the user is inserting their own profile
  auth.uid() = user_id 
  OR 
  -- Allow if this is being called from a trigger (no authenticated user)
  auth.uid() IS NULL
);