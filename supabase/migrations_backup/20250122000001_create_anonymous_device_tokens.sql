-- Create table for storing device tokens for anonymous users (no login required)
CREATE TABLE IF NOT EXISTS public.anonymous_device_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL UNIQUE, -- Generated client-side UUID for device identification
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
  device_info JSONB,
  location_lat DECIMAL(10, 8), -- Allow location-based notifications
  location_lng DECIMAL(11, 8),
  location_name TEXT,
  service_categories TEXT[], -- Array of service categories user is interested in
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.anonymous_device_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies - allow all operations since this is for anonymous users
CREATE POLICY "Allow all operations on anonymous device tokens" 
ON public.anonymous_device_tokens 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_anonymous_device_tokens_device_id ON public.anonymous_device_tokens(device_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_device_tokens_active ON public.anonymous_device_tokens(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_anonymous_device_tokens_location ON public.anonymous_device_tokens USING GIST (point(location_lng, location_lat)) WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_anonymous_device_tokens_categories ON public.anonymous_device_tokens USING GIN (service_categories) WHERE service_categories IS NOT NULL;

-- Create RPC function to insert/update anonymous device tokens
CREATE OR REPLACE FUNCTION public.insert_anonymous_device_token(
  p_device_id TEXT,
  p_token TEXT,
  p_platform TEXT,
  p_device_info JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.anonymous_device_tokens (device_id, token, platform, device_info, updated_at)
  VALUES (p_device_id, p_token, p_platform, p_device_info, now())
  ON CONFLICT (device_id) 
  DO UPDATE SET 
    token = EXCLUDED.token,
    platform = EXCLUDED.platform,
    device_info = EXCLUDED.device_info,
    is_active = true,
    updated_at = now();
END;
$$;