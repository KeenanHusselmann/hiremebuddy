-- Create function to get completed jobs per provider (labourer)
CREATE OR REPLACE FUNCTION public.get_completed_jobs(provider_ids uuid[])
RETURNS TABLE(provider_id uuid, completed_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT labourer_id AS provider_id, COUNT(*)::int AS completed_count
  FROM public.bookings
  WHERE status = 'completed' AND labourer_id = ANY(provider_ids)
  GROUP BY labourer_id;
END;
$$;