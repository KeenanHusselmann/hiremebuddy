-- Allow authenticated users to insert new subcategories
CREATE POLICY "Authenticated users can create subcategories" 
ON public.service_subcategories 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update subcategories they created
-- We'll add a created_by field to track who created each subcategory
ALTER TABLE public.service_subcategories 
ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Update the insert policy to include the created_by field
DROP POLICY "Authenticated users can create subcategories" ON public.service_subcategories;

CREATE POLICY "Authenticated users can create subcategories" 
ON public.service_subcategories 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

-- Allow users to update subcategories they created
CREATE POLICY "Users can update their own subcategories" 
ON public.service_subcategories 
FOR UPDATE 
USING (created_by = auth.uid());