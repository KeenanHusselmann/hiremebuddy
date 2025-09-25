-- Additional helper functions for anonymous device management

-- Create function to get device token count (useful for admin dashboard)
CREATE OR REPLACE FUNCTION public.get_anonymous_device_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  count_result INTEGER;
BEGIN
  -- Only count if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'anonymous_device_tokens' AND table_schema = 'public') THEN
    SELECT COUNT(*) INTO count_result FROM public.anonymous_device_tokens WHERE is_active = true;
    RETURN count_result;
  ELSE
    RETURN 0;
  END IF;
END;
$$;

-- Create function to cleanup inactive tokens (can be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_inactive_device_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Only cleanup if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'anonymous_device_tokens' AND table_schema = 'public') THEN
    -- Delete tokens that haven't been updated in 30 days
    DELETE FROM public.anonymous_device_tokens 
    WHERE updated_at < now() - INTERVAL '30 days' 
    AND is_active = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
  ELSE
    RETURN 0;
  END IF;
END;
$$;