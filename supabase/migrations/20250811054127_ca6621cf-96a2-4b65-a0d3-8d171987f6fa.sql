-- Create a function to fetch public service ratings without exposing bookings via RLS
CREATE OR REPLACE FUNCTION public.get_service_ratings(service_ids uuid[])
RETURNS TABLE (
  service_id uuid,
  average_rating numeric,
  review_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT b.service_id,
         AVG(r.rating)::numeric AS average_rating,
         COUNT(r.id)::int AS review_count
  FROM public.reviews r
  JOIN public.bookings b ON b.id = r.booking_id
  WHERE b.service_id = ANY(service_ids)
  GROUP BY b.service_id;
END;
$$;

-- Ensure appropriate execute permissions
GRANT EXECUTE ON FUNCTION public.get_service_ratings(uuid[]) TO anon, authenticated;