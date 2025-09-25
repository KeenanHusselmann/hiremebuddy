-- Fix FK to allow deleting auth users by setting dependent references to NULL
DO $$
BEGIN
  -- Drop existing FK if present
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'service_subcategories_created_by_fkey'
  ) THEN
    ALTER TABLE public.service_subcategories
      DROP CONSTRAINT service_subcategories_created_by_fkey;
  END IF;
END $$;

-- Recreate FK with ON DELETE SET NULL
ALTER TABLE public.service_subcategories
  ADD CONSTRAINT service_subcategories_created_by_fkey
  FOREIGN KEY (created_by)
  REFERENCES auth.users (id)
  ON DELETE SET NULL;
