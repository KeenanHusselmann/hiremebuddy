-- Ensure full row data for realtime updates
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add tables to realtime publication (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- Create or replace the create_notification function (defensive)
CREATE OR REPLACE FUNCTION public.create_notification(
    user_id_param uuid, 
    type_param text, 
    message_param text, 
    category_param text DEFAULT 'general'::text, 
    target_url_param text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    notification_id UUID;
BEGIN
    RAISE LOG 'Creating notification for user %, type %, message %', user_id_param, type_param, message_param;
    
    INSERT INTO public.notifications (user_id, type, message, category, target_url)
    VALUES (user_id_param, type_param, message_param, category_param, target_url_param)
    RETURNING id INTO notification_id;
    
    RAISE LOG 'Notification created with ID: %', notification_id;
    
    RETURN notification_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error creating notification: %', SQLERRM;
        RAISE;
END;
$function$;

-- Create or replace the message notification trigger function with robust logging
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
    RAISE LOG 'Message notification trigger fired for message ID: %', NEW.id;

    -- Only notify when sender and receiver differ
    IF NEW.sender_id != NEW.receiver_id THEN
        RAISE LOG 'Creating notification for sender % -> receiver %', NEW.sender_id, NEW.receiver_id;

        -- Sender profile
        SELECT full_name INTO sender_profile 
        FROM profiles WHERE id = NEW.sender_id;

        -- Service info via booking
        SELECT s.service_name INTO service_info 
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        WHERE b.id = NEW.booking_id;

        -- Human-friendly message
        IF service_info.service_name IS NOT NULL THEN
            notification_message := COALESCE(sender_profile.full_name, 'Someone') ||
                ' sent you a message about your ' || service_info.service_name || ' booking.';
        ELSE
            notification_message := COALESCE(sender_profile.full_name, 'Someone') || ' sent you a new message.';
        END IF;

        RAISE LOG 'Notification message: %', notification_message;

        -- Create notification
        PERFORM public.create_notification(
            NEW.receiver_id,
            'new_message',
            notification_message,
            'message',
            '/bookings/' || NEW.booking_id
        );

        RAISE LOG 'Notification created successfully for receiver %', NEW.receiver_id;
    ELSE
        RAISE LOG 'Skipping notification: sender equals receiver %', NEW.sender_id;
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in notify_new_message(): %', SQLERRM;
        RETURN NEW; -- Never block message inserts
END;
$function$;

-- Recreate the trigger to ensure it exists and points to the correct function
DROP TRIGGER IF EXISTS message_notification_trigger ON public.messages;
CREATE TRIGGER message_notification_trigger
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_new_message();