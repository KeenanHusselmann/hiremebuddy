-- Enable realtime for existing tables
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add the tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Create messages table for real-time chat
CREATE TABLE public.messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for messages
CREATE POLICY "Users can view messages in their bookings" 
ON public.messages 
FOR SELECT 
USING (
    booking_id IN (
        SELECT id FROM public.bookings 
        WHERE client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR labourer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Users can send messages in their bookings" 
ON public.messages 
FOR INSERT 
WITH CHECK (
    sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND booking_id IN (
        SELECT id FROM public.bookings 
        WHERE client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR labourer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Users can update their own messages" 
ON public.messages 
FOR UPDATE 
USING (sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Enable realtime for messages
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create trigger for message updates
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create user presence table for real-time status
CREATE TABLE public.user_presence (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_presence
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_presence
CREATE POLICY "User presence is viewable by everyone" 
ON public.user_presence 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own presence" 
ON public.user_presence 
FOR ALL 
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Enable realtime for user_presence
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;

-- Create trigger for presence updates
CREATE TRIGGER update_user_presence_updated_at
    BEFORE UPDATE ON public.user_presence
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically update user presence
CREATE OR REPLACE FUNCTION public.update_user_presence(status_param TEXT DEFAULT 'online')
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Add notification types for better categorization
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general' CHECK (category IN ('booking', 'message', 'system', 'payment', 'review', 'general'));

-- Function to create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
    user_id_param UUID,
    type_param TEXT,
    message_param TEXT,
    category_param TEXT DEFAULT 'general',
    target_url_param TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Trigger to create notifications for new messages
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create notification for the receiver
    PERFORM public.create_notification(
        NEW.receiver_id,
        'new_message',
        'You have a new message',
        'message',
        '/bookings/' || NEW.booking_id
    );
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_message_created
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_new_message();

-- Trigger to create notifications for booking status changes
CREATE OR REPLACE FUNCTION public.notify_booking_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only send notification if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Notify client
        PERFORM public.create_notification(
            NEW.client_id,
            'booking_status_changed',
            'Your booking status has been updated to: ' || NEW.status,
            'booking',
            '/bookings/' || NEW.id
        );
        
        -- Notify labourer
        PERFORM public.create_notification(
            NEW.labourer_id,
            'booking_status_changed',
            'Booking status has been updated to: ' || NEW.status,
            'booking',
            '/bookings/' || NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_booking_status_changed
    AFTER UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_booking_status_change();