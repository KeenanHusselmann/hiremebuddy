-- Create trigger to notify providers when new bookings are created
CREATE OR REPLACE FUNCTION public.notify_new_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Notify the labourer/provider about the new booking request
    PERFORM public.create_notification(
        NEW.labourer_id,
        'new_booking_request',
        'You have a new booking request for your service',
        'booking',
        '/bookings/' || NEW.id
    );
    
    RETURN NEW;
END;
$function$;

-- Create trigger that fires on new booking insertions
CREATE TRIGGER on_booking_created
    AFTER INSERT ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_new_booking();