-- Add admin role to user_type enum
ALTER TYPE public.user_type ADD VALUE IF NOT EXISTS 'admin';

-- Create admin_settings table for admin configuration
CREATE TABLE public.admin_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Only admins can access settings" 
ON public.admin_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'admin'
  )
);

-- Insert default admin settings
INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
('platform_name', '"HireMeBra"', 'Platform display name'),
('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
('max_bookings_per_day', '50', 'Maximum bookings allowed per day'),
('commission_rate', '0.15', 'Platform commission rate (15%)');

-- Create trigger for admin_settings updated_at
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();