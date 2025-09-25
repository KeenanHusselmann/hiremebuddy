-- Create user type enum
CREATE TYPE public.user_type AS ENUM ('client', 'labourer', 'both');

-- Create booking status enum  
CREATE TYPE public.booking_status AS ENUM ('pending', 'accepted', 'rejected', 'completed', 'cancelled');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  user_type user_type NOT NULL DEFAULT 'client',
  contact_number TEXT,
  whatsapp_link TEXT,
  facebook_link TEXT,
  location_text TEXT DEFAULT 'Windhoek, Namibia',
  latitude NUMERIC,
  longitude NUMERIC,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  labourer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  description TEXT NOT NULL,
  hourly_rate NUMERIC,
  portfolio_images TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  labourer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  target_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for services
CREATE POLICY "Services are viewable by everyone" 
ON public.services FOR SELECT 
USING (true);

CREATE POLICY "Labourers can manage their own services" 
ON public.services FOR ALL 
USING (labourer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create RLS policies for bookings
CREATE POLICY "Users can view their own bookings" 
ON public.bookings FOR SELECT 
USING (
  client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  labourer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Clients can create bookings" 
ON public.bookings FOR INSERT 
WITH CHECK (client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own bookings" 
ON public.bookings FOR UPDATE 
USING (
  client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  labourer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Create RLS policies for reviews
CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews FOR SELECT 
USING (true);

CREATE POLICY "Users can create reviews for their completed bookings" 
ON public.reviews FOR INSERT 
WITH CHECK (reviewer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can insert notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
    COALESCE((NEW.raw_user_meta_data ->> 'user_type')::user_type, 'client')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample services data
INSERT INTO public.profiles (user_id, full_name, user_type, contact_number, whatsapp_link, location_text, bio) VALUES
  ('00000000-0000-0000-0000-000000000001', 'John Plumber', 'labourer', '+264812345678', 'https://wa.me/264812345678', 'Windhoek, Namibia', 'Expert plumber with 10+ years experience'),
  ('00000000-0000-0000-0000-000000000002', 'Sarah Electrician', 'labourer', '+264823456789', 'https://wa.me/264823456789', 'Swakopmund, Namibia', 'Certified electrician specializing in residential and commercial work'),
  ('00000000-0000-0000-0000-000000000003', 'Mike Carpenter', 'labourer', '+264834567890', 'https://wa.me/264834567890', 'Oshakati, Namibia', 'Custom woodwork and furniture specialist');

INSERT INTO public.services (labourer_id, service_name, description, hourly_rate, portfolio_images) VALUES
  ((SELECT id FROM public.profiles WHERE full_name = 'John Plumber'), 'Plumbing Services', 'Complete plumbing solutions including installation, repair, and maintenance', 150.00, ARRAY['https://images.unsplash.com/photo-1581094794329-c8112a89af12']),
  ((SELECT id FROM public.profiles WHERE full_name = 'John Plumber'), 'Emergency Plumbing', '24/7 emergency plumbing services', 200.00, ARRAY['https://images.unsplash.com/photo-1581094794329-c8112a89af12']),
  ((SELECT id FROM public.profiles WHERE full_name = 'Sarah Electrician'), 'Electrical Installation', 'Professional electrical installation and wiring', 180.00, ARRAY['https://images.unsplash.com/photo-1621905251189-08b45d6a269e']),
  ((SELECT id FROM public.profiles WHERE full_name = 'Sarah Electrician'), 'Solar Panel Setup', 'Solar panel installation and maintenance', 250.00, ARRAY['https://images.unsplash.com/photo-1509391366360-2e959784a276']),
  ((SELECT id FROM public.profiles WHERE full_name = 'Mike Carpenter'), 'Custom Furniture', 'Handcrafted wooden furniture and cabinetry', 120.00, ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7']),
  ((SELECT id FROM public.profiles WHERE full_name = 'Mike Carpenter'), 'Home Renovation', 'Complete home renovation and woodwork', 160.00, ARRAY['https://images.unsplash.com/photo-1581094794329-c8112a89af12']);