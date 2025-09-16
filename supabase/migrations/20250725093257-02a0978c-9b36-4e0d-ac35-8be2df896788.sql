-- Fix the notify_new_message function to use proper profile IDs
CREATE OR REPLACE FUNCTION public.notify_new_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    sender_profile RECORD;
    service_info RECORD;
    notification_message TEXT;
BEGIN
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
    
    RETURN NEW;
END;
$function$

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS notify_message_trigger ON messages;

CREATE TRIGGER notify_message_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_message();