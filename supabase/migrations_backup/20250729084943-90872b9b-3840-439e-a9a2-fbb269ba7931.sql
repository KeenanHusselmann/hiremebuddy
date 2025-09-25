-- Create a simplified notification trigger that won't cause constraint issues
CREATE OR REPLACE FUNCTION public.simple_message_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Only create notification if sender and receiver are different
    IF NEW.sender_id != NEW.receiver_id THEN
        -- Insert a simple notification with correct category
        INSERT INTO public.notifications (user_id, type, message, category, target_url)
        VALUES (
            NEW.receiver_id,
            'new_message',
            'You have received a new message',
            'message',
            '/bookings/' || NEW.booking_id
        );
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Create the trigger
CREATE TRIGGER simple_message_notification_trigger
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION simple_message_notification();