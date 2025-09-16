-- Fix the notification trigger to use correct enum values
CREATE OR REPLACE FUNCTION public.notify_booking_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    client_profile RECORD;
    provider_profile RECORD;
    service_info RECORD;
    client_message TEXT;
    provider_message TEXT;
BEGIN
    -- Only send notification if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Get client profile
        SELECT full_name INTO client_profile 
        FROM profiles WHERE id = NEW.client_id;
        
        -- Get provider profile
        SELECT full_name INTO provider_profile 
        FROM profiles WHERE id = NEW.labourer_id;
        
        -- Get service information
        SELECT service_name INTO service_info 
        FROM services WHERE id = NEW.service_id;
        
        -- Create user-friendly messages based on status using correct enum values
        CASE NEW.status
            WHEN 'accepted' THEN
                client_message := provider_profile.full_name || ' has accepted your booking request for ' || service_info.service_name || '. They will contact you soon to confirm details.';
                provider_message := 'You have accepted the booking request from ' || client_profile.full_name || ' for ' || service_info.service_name || '.';
            WHEN 'completed' THEN
                client_message := 'Your ' || service_info.service_name || ' service with ' || provider_profile.full_name || ' has been completed. Please consider leaving a review.';
                provider_message := 'You have marked the service for ' || client_profile.full_name || ' (' || service_info.service_name || ') as completed.';
            WHEN 'rejected' THEN
                client_message := 'Your booking for ' || service_info.service_name || ' with ' || provider_profile.full_name || ' has been declined.';
                provider_message := 'You have declined the booking request from ' || client_profile.full_name || ' for ' || service_info.service_name || '.';
            WHEN 'cancelled' THEN
                client_message := 'Your booking for ' || service_info.service_name || ' with ' || provider_profile.full_name || ' has been cancelled.';
                provider_message := 'You have cancelled the booking with ' || client_profile.full_name || ' for ' || service_info.service_name || '.';
            ELSE
                client_message := 'Your booking status has been updated to: ' || NEW.status;
                provider_message := 'Booking status has been updated to: ' || NEW.status;
        END CASE;
        
        -- Notify client
        PERFORM public.create_notification(
            NEW.client_id,
            CASE NEW.status
                WHEN 'accepted' THEN 'booking_accepted'
                WHEN 'completed' THEN 'service_completed'
                WHEN 'rejected' THEN 'booking_rejected'
                WHEN 'cancelled' THEN 'booking_cancelled'
                ELSE 'booking_status_changed'
            END,
            client_message,
            'booking',
            '/bookings/' || NEW.id
        );
        
        -- Notify provider
        PERFORM public.create_notification(
            NEW.labourer_id,
            CASE NEW.status
                WHEN 'accepted' THEN 'booking_confirmed'
                WHEN 'completed' THEN 'service_completed'
                WHEN 'rejected' THEN 'booking_rejected'
                WHEN 'cancelled' THEN 'booking_cancelled'
                ELSE 'booking_status_changed'
            END,
            provider_message,
            'booking',
            '/bookings/' || NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$function$;