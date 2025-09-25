-- Add sub_categories table for better service organization  
CREATE TABLE public.service_subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_subcategories ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing subcategories
CREATE POLICY "Service subcategories are viewable by everyone" 
ON public.service_subcategories 
FOR SELECT 
USING (true);

-- Add subcategory_id to services table
ALTER TABLE public.services 
ADD COLUMN subcategory_id UUID REFERENCES public.service_subcategories(id);

-- Add trigger for updated_at
CREATE TRIGGER update_service_subcategories_updated_at
BEFORE UPDATE ON public.service_subcategories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample subcategories for existing categories
INSERT INTO public.service_subcategories (category_id, name, description) 
SELECT 
  sc.id,
  subcategory.name,
  subcategory.description
FROM public.service_categories sc
CROSS JOIN (
  VALUES 
    ('Residential Plumbing', 'Home and apartment plumbing services'),
    ('Commercial Plumbing', 'Business and office plumbing'),
    ('Emergency Plumbing', '24/7 urgent plumbing repairs'),
    ('Pipe Installation', 'New pipe installation and replacement')
) AS subcategory(name, description)
WHERE sc.name = 'plumbing'

UNION ALL

SELECT 
  sc.id,
  subcategory.name,
  subcategory.description
FROM public.service_categories sc
CROSS JOIN (
  VALUES 
    ('House Wiring', 'Residential electrical wiring'),
    ('Commercial Electrical', 'Business electrical services'),
    ('Solar Installation', 'Solar panel installation and maintenance'),
    ('Electrical Repairs', 'Emergency electrical repairs')
) AS subcategory(name, description)
WHERE sc.name = 'electrical'

UNION ALL

SELECT 
  sc.id,
  subcategory.name,
  subcategory.description
FROM public.service_categories sc
CROSS JOIN (
  VALUES 
    ('Custom Furniture', 'Bespoke furniture creation'),
    ('Kitchen Cabinets', 'Kitchen cabinet installation'),
    ('Door & Window Frames', 'Door and window carpentry'),
    ('Furniture Repair', 'Furniture restoration and repair')
) AS subcategory(name, description)
WHERE sc.name = 'carpentry';