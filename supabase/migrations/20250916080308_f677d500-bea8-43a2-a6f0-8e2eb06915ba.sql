-- Create separate table for sensitive verification documents
CREATE TABLE public.verification_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  id_document_front_path TEXT,
  id_document_back_path TEXT,
  selfie_image_path TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  verification_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on verification documents table
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is verification admin
CREATE OR REPLACE FUNCTION public.is_verification_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = _user_id AND p.user_type = 'admin'
  );
$$;

-- Only verification admins can access verification documents
CREATE POLICY "Only verification admins can access verification documents" 
ON public.verification_documents
FOR ALL
USING (is_verification_admin(auth.uid()));

-- Users can insert their own verification documents during signup
CREATE POLICY "Users can submit their own verification documents" 
ON public.verification_documents
FOR INSERT
WITH CHECK (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Users can view their own verification status (but not the sensitive document paths)
CREATE POLICY "Users can view their own verification status" 
ON public.verification_documents
FOR SELECT
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Migrate existing verification data to new table
INSERT INTO public.verification_documents (
  profile_id,
  id_document_front_path,
  id_document_back_path,
  selfie_image_path,
  verification_status,
  verification_notes,
  verified_at,
  verified_by
)
SELECT 
  id,
  id_document_image_path,
  id_document_back_image_path,
  selfie_image_path,
  verification_status,
  verification_notes,
  verified_at,
  verified_by
FROM public.profiles
WHERE id_document_image_path IS NOT NULL 
   OR id_document_back_image_path IS NOT NULL 
   OR selfie_image_path IS NOT NULL;

-- Remove sensitive columns from profiles table
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS id_document_image_path,
DROP COLUMN IF EXISTS id_document_back_image_path,
DROP COLUMN IF EXISTS selfie_image_path,
DROP COLUMN IF EXISTS verification_notes;

-- Create trigger for updating timestamps
CREATE TRIGGER update_verification_documents_updated_at
BEFORE UPDATE ON public.verification_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update verification status change notification trigger
CREATE OR REPLACE FUNCTION public.notify_verification_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Only send notification if verification status changed
    IF OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
        -- Get the profile to notify
        PERFORM public.create_notification(
            NEW.profile_id,
            CASE 
                WHEN NEW.verification_status = 'approved' THEN 'profile_verified'
                ELSE 'profile_verification_rejected'
            END,
            CASE 
                WHEN NEW.verification_status = 'approved' THEN 'Congratulations! Your profile has been verified. You can now offer your services.'
                ELSE 'Your profile verification was not approved. Please contact support for more information.'
            END,
            'system',
            '/profile'
        );
        
        -- Update the is_verified flag in profiles table
        UPDATE public.profiles 
        SET 
          is_verified = CASE WHEN NEW.verification_status = 'approved' THEN true ELSE false END,
          verified_at = CASE WHEN NEW.verification_status = 'approved' THEN now() ELSE NULL END,
          verified_by = CASE WHEN NEW.verification_status = 'approved' THEN auth.uid() ELSE NULL END
        WHERE id = NEW.profile_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for verification status changes
CREATE TRIGGER notify_verification_status_change
AFTER UPDATE ON public.verification_documents
FOR EACH ROW
EXECUTE FUNCTION public.notify_verification_status_change();