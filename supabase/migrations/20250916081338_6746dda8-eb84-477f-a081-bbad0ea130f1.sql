-- Add foreign key constraint to verification_documents table
ALTER TABLE public.verification_documents 
ADD CONSTRAINT verification_documents_profile_id_fkey 
FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;