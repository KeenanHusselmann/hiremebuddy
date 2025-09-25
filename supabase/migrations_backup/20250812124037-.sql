-- 1) Allow deleting authenticated users by fixing FK on service_subcategories.created_by
ALTER TABLE public.service_subcategories
  DROP CONSTRAINT IF EXISTS service_subcategories_created_by_fkey;

ALTER TABLE public.service_subcategories
  ADD CONSTRAINT service_subcategories_created_by_fkey
  FOREIGN KEY (created_by)
  REFERENCES auth.users (id)
  ON DELETE SET NULL;\n
-- 2) Backfill profiles for existing auth users so admin detection works
INSERT INTO public.profiles (user_id, full_name, user_type, contact_number, location_text)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data ->> 'full_name', 'New User') AS full_name,
  'client'::public.user_type AS user_type,
  u.raw_user_meta_data ->> 'contact_number' AS contact_number,
  COALESCE(u.raw_user_meta_data ->> 'location_text', 'Windhoek, Namibia') AS location_text
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;