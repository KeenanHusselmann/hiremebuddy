-- Create provider_categories table to store provider specializations
CREATE TABLE public.provider_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES public.service_subcategories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id, category_id, subcategory_id)
);

-- Enable RLS
ALTER TABLE public.provider_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Provider categories are viewable by everyone" 
ON public.provider_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Providers can manage their own categories" 
ON public.provider_categories 
FOR ALL 
USING (provider_id IN (
  SELECT profiles.id 
  FROM profiles 
  WHERE profiles.user_id = auth.uid()
));

-- Add trigger for updated_at
CREATE TRIGGER update_provider_categories_updated_at
BEFORE UPDATE ON public.provider_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();