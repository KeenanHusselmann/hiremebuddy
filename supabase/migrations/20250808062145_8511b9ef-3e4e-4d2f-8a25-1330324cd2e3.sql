-- Fix reviews to be globally visible (reviews should be public to see ratings)
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;

CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews 
FOR SELECT 
USING (true);

-- Fix the message notification trigger to create proper notifications
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    sender_profile RECORD;
    service_info RECORD;
    notification_message TEXT;
BEGIN
    -- Only create notification if sender and receiver are different
    IF NEW.sender_id != NEW.receiver_id THEN
        -- Get sender profile name
        SELECT full_name INTO sender_profile 
        FROM profiles WHERE id = NEW.sender_id;
        
        -- Get service information from booking
        SELECT s.service_name INTO service_info 
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        WHERE b.id = NEW.booking_id;
        
        -- Create user-friendly message
        IF service_info.service_name IS NOT NULL THEN
            notification_message := sender_profile.full_name || ' sent you a message about your ' || service_info.service_name || ' booking.';
        ELSE
            notification_message := sender_profile.full_name || ' sent you a new message.';
        END IF;
        
        -- Create notification for the receiver
        PERFORM public.create_notification(
            NEW.receiver_id,
            'new_message',
            notification_message,
            'message',
            '/bookings/' || NEW.booking_id
        );
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS message_notification_trigger ON public.messages;
CREATE TRIGGER message_notification_trigger
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_new_message();