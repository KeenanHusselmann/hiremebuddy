-- Fix security warnings by setting proper search paths for all functions

-- Update notify_booking_status_change with proper search path
CREATE OR REPLACE FUNCTION public.notify_booking_status_change()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
        
        -- Create user-friendly messages based on status
        CASE NEW.status
            WHEN 'confirmed' THEN
                client_message := provider_profile.full_name || ' has accepted your booking request for ' || service_info.service_name || '. They will contact you soon to confirm details.';
                provider_message := 'You have accepted the booking request from ' || client_profile.full_name || ' for ' || service_info.service_name || '.';
            WHEN 'in_progress' THEN
                client_message := 'Your ' || service_info.service_name || ' service with ' || provider_profile.full_name || ' is now in progress.';
                provider_message := 'Your service for ' || client_profile.full_name || ' (' || service_info.service_name || ') is marked as in progress.';
            WHEN 'completed' THEN
                client_message := 'Your ' || service_info.service_name || ' service with ' || provider_profile.full_name || ' has been completed. Please consider leaving a review.';
                provider_message := 'You have marked the service for ' || client_profile.full_name || ' (' || service_info.service_name || ') as completed.';
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
                WHEN 'confirmed' THEN 'booking_accepted'
                WHEN 'in_progress' THEN 'service_started'
                WHEN 'completed' THEN 'service_completed'
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
                WHEN 'confirmed' THEN 'booking_confirmed'
                WHEN 'in_progress' THEN 'service_started'
                WHEN 'completed' THEN 'service_completed'
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
$$;

-- Update notify_new_booking with proper search path
CREATE OR REPLACE FUNCTION public.notify_new_booking()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    client_profile RECORD;
    service_info RECORD;
    notification_message TEXT;
BEGIN
    -- Get client profile
    SELECT full_name INTO client_profile 
    FROM profiles WHERE id = NEW.client_id;
    
    -- Get service information
    SELECT service_name INTO service_info 
    FROM services WHERE id = NEW.service_id;
    
    -- Create user-friendly message
    notification_message := client_profile.full_name || ' has requested to book your ' || service_info.service_name || ' service for ' || TO_CHAR(NEW.booking_date, 'FMMonth DD, YYYY') || ' at ' || NEW.booking_time || '.';
    
    -- Notify the provider about the new booking request
    PERFORM public.create_notification(
        NEW.labourer_id,
        'new_booking_request',
        notification_message,
        'booking',
        '/bookings/' || NEW.id
    );
    
    -- Also notify the client that their request was submitted
    PERFORM public.create_notification(
        NEW.client_id,
        'booking_submitted',
        'Your booking request for ' || service_info.service_name || ' has been submitted successfully. The provider will respond soon.',
        'booking',
        '/bookings/' || NEW.id
    );
    
    RETURN NEW;
END;
$$;

-- Update notify_new_quote_request with proper search path
CREATE OR REPLACE FUNCTION public.notify_new_quote_request()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    client_profile RECORD;
    provider_profile RECORD;
    service_info RECORD;
    notification_message TEXT;
BEGIN
    -- Get client profile
    SELECT full_name INTO client_profile 
    FROM profiles WHERE id = NEW.client_id;
    
    -- Get provider profile
    SELECT full_name INTO provider_profile 
    FROM profiles WHERE id = NEW.labourer_id;
    
    -- Get service information if available
    IF NEW.service_id IS NOT NULL THEN
        SELECT service_name INTO service_info 
        FROM services WHERE id = NEW.service_id;
        
        notification_message := client_profile.full_name || ' has requested a quote for your ' || service_info.service_name || ' service.';
    ELSE
        notification_message := client_profile.full_name || ' has requested a quote for a custom project.';
    END IF;
    
    -- Notify the provider about the new quote request
    PERFORM public.create_notification(
        NEW.labourer_id,
        'quote_request',
        notification_message,
        'quote',
        '/quote-requests/' || NEW.id
    );
    
    -- Also notify the client that their quote request was submitted
    PERFORM public.create_notification(
        NEW.client_id,
        'quote_submitted',
        'Your quote request has been sent to ' || provider_profile.full_name || '. They will respond with a quote soon.',
        'quote',
        '/quote-requests/' || NEW.id
    );
    
    RETURN NEW;
END;
$$;

-- Update notify_new_message with proper search path
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    sender_profile RECORD;
    service_info RECORD;
    notification_message TEXT;
BEGIN
    -- Get sender profile
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
$$;

-- Update notify_quote_response with proper search path
CREATE OR REPLACE FUNCTION public.notify_quote_response()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    client_profile RECORD;
    provider_profile RECORD;
    service_info RECORD;
    notification_message TEXT;
BEGIN
    -- Only notify if quote amount was added (provider responded)
    IF OLD.quote_amount IS NULL AND NEW.quote_amount IS NOT NULL THEN
        -- Get client profile
        SELECT full_name INTO client_profile 
        FROM profiles WHERE id = NEW.client_id;
        
        -- Get provider profile
        SELECT full_name INTO provider_profile 
        FROM profiles WHERE id = NEW.labourer_id;
        
        -- Create user-friendly message
        notification_message := provider_profile.full_name || ' has responded to your quote request with an offer of N$' || NEW.quote_amount || '.';
        
        -- Notify the client about the quote response
        PERFORM public.create_notification(
            NEW.client_id,
            'quote_received',
            notification_message,
            'quote',
            '/quote-requests/' || NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Update existing functions with proper search path
CREATE OR REPLACE FUNCTION public.create_notification(user_id_param uuid, type_param text, message_param text, category_param text DEFAULT 'general'::text, target_url_param text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, type, message, category, target_url)
    VALUES (user_id_param, type_param, message_param, category_param, target_url_param)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- Update update_user_presence with proper search path
CREATE OR REPLACE FUNCTION public.update_user_presence(status_param text DEFAULT 'online'::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    profile_id UUID;
BEGIN
    -- Get the profile ID for the current user
    SELECT id INTO profile_id 
    FROM public.profiles 
    WHERE user_id = auth.uid();
    
    IF profile_id IS NOT NULL THEN
        -- Insert or update user presence
        INSERT INTO public.user_presence (user_id, status, last_seen)
        VALUES (profile_id, status_param, now())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            status = status_param,
            last_seen = now(),
            updated_at = now();
    END IF;
END;
$$;

-- Update handle_new_user with proper search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, user_type, contact_number, location_text)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'user_type' = 'labourer' THEN 'labourer'::public.user_type
      WHEN NEW.raw_user_meta_data ->> 'user_type' = 'client' THEN 'client'::public.user_type
      WHEN NEW.raw_user_meta_data ->> 'user_type' = 'both' THEN 'both'::public.user_type
      ELSE 'client'::public.user_type
    END,
    NEW.raw_user_meta_data ->> 'contact_number',
    COALESCE(NEW.raw_user_meta_data ->> 'location_text', 'Windhoek, Namibia')
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Update update_updated_at_column with proper search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;