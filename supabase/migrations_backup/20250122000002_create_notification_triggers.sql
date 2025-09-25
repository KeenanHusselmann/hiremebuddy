-- Create function to update anonymous device location and preferences
CREATE OR REPLACE FUNCTION public.update_anonymous_device_preferences(
  p_device_id TEXT,
  p_location_lat DECIMAL(10, 8) DEFAULT NULL,
  p_location_lng DECIMAL(11, 8) DEFAULT NULL,
  p_location_name TEXT DEFAULT NULL,
  p_service_categories TEXT[] DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only update if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'anonymous_device_tokens' AND table_schema = 'public') THEN
    UPDATE public.anonymous_device_tokens 
    SET 
      location_lat = COALESCE(p_location_lat, location_lat),
      location_lng = COALESCE(p_location_lng, location_lng),
      location_name = COALESCE(p_location_name, location_name),
      service_categories = COALESCE(p_service_categories, service_categories),
      updated_at = now()
    WHERE device_id = p_device_id;
  END IF;
END;
$$;

-- Note: Trigger functions for bookings, messages, and services will be created
-- when those tables are available in the production environment
-- This migration creates the core anonymous device functionality