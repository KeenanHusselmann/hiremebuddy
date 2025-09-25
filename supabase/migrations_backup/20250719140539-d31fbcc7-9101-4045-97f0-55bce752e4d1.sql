-- Clean up dummy data except for one record from each table
-- Keep one profile for testing
DELETE FROM public.profiles WHERE id NOT IN (
  SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 1
);

-- Keep one service for testing
DELETE FROM public.services WHERE id NOT IN (
  SELECT id FROM public.services ORDER BY created_at ASC LIMIT 1
);

-- Clear all bookings to start fresh
DELETE FROM public.bookings;

-- Clear all messages to start fresh
DELETE FROM public.messages;

-- Clear all reviews to start fresh
DELETE FROM public.reviews;

-- Clear all notifications to start fresh
DELETE FROM public.notifications;

-- Clear all user presence records to start fresh
DELETE FROM public.user_presence;

-- Create service categories table
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert standard service categories for Namibia
INSERT INTO public.service_categories (name, description, icon_name) VALUES
('plumbing', 'Plumbing and water systems', 'wrench'),
('electrical', 'Electrical installations and repairs', 'zap'),
('construction', 'Construction and building services', 'hammer'),
('cleaning', 'Cleaning and maintenance services', 'spray-can'),
('gardening', 'Gardening and landscaping', 'tree-pine'),
('painting', 'Painting and decorating', 'paint-brush'),
('carpentry', 'Carpentry and woodwork', 'saw'),
('automotive', 'Vehicle maintenance and repair', 'car'),
('security', 'Security services and installations', 'shield'),
('catering', 'Catering and food services', 'chef-hat'),
('photography', 'Photography and videography', 'camera'),
('tutoring', 'Educational and tutoring services', 'book-open'),
('beauty', 'Beauty and wellness services', 'sparkles'),
('delivery', 'Delivery and transportation', 'truck'),
('it-services', 'IT and computer services', 'monitor');

-- Create Namibian towns table
CREATE TABLE IF NOT EXISTS public.namibian_towns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  region TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert major Namibian towns
INSERT INTO public.namibian_towns (name, region) VALUES
('Windhoek', 'Khomas'),
('Walvis Bay', 'Erongo'),
('Swakopmund', 'Erongo'),
('Rundu', 'Kavango East'),
('Oshakati', 'Oshana'),
('Rehoboth', 'Hardap'),
('Katima Mulilo', 'Zambezi'),
('Otjiwarongo', 'Otjozondjupa'),
('Okahandja', 'Otjozondjupa'),
('Ondangwa', 'Oshana'),
('Ongwediva', 'Oshana'),
('Gobabis', 'Omaheke'),
('Henties Bay', 'Erongo'),
('Tsumeb', 'Oshikoto'),
('Grootfontein', 'Otjozondjupa'),
('Mariental', 'Hardap'),
('Keetmanshoop', 'Karas'),
('Aranos', 'Hardap'),
('Karibib', 'Erongo'),
('Omaruru', 'Erongo'),
('Outjo', 'Kunene'),
('Usakos', 'Erongo'),
('Khorixas', 'Kunene'),
('Opuwo', 'Kunene'),
('Lüderitz', 'Karas'),
('Maltahöhe', 'Hardap'),
('Bethanien', 'Karas'),
('Aus', 'Karas'),
('Helmeringhausen', 'Karas'),
('Stampriet', 'Hardap');

-- Add category_id to services table
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.service_categories(id);

-- Add town to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS town TEXT DEFAULT 'Windhoek';

-- Update the existing service with a proper category
UPDATE public.services 
SET category_id = (SELECT id FROM public.service_categories WHERE name = 'plumbing' LIMIT 1)
WHERE category_id IS NULL;

-- Enable RLS on new tables
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.namibian_towns ENABLE ROW LEVEL SECURITY;

-- Create policies for service categories (public read access)
CREATE POLICY "Service categories are viewable by everyone" 
ON public.service_categories 
FOR SELECT 
USING (true);

-- Create policies for Namibian towns (public read access)
CREATE POLICY "Namibian towns are viewable by everyone" 
ON public.namibian_towns 
FOR SELECT 
USING (true);

-- Create trigger for service categories updated_at
CREATE TRIGGER update_service_categories_updated_at
BEFORE UPDATE ON public.service_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();