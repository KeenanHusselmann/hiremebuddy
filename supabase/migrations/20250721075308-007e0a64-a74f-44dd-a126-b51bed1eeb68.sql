-- Add a trigger to send notifications when profile verification status changes
CREATE OR REPLACE FUNCTION public.notify_verification_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Only send notification if verification status changed
    IF OLD.is_verified IS DISTINCT FROM NEW.is_verified THEN
        -- Notify the user about verification status change
        PERFORM public.create_notification(
            NEW.id,
            CASE 
                WHEN NEW.is_verified = true THEN 'profile_verified'
                ELSE 'profile_verification_rejected'
            END,
            CASE 
                WHEN NEW.is_verified = true THEN 'Congratulations! Your profile has been verified. You can now offer your services.'
                ELSE 'Your profile verification was not approved. Please contact support for more information.'
            END,
            'system',
            '/profile'
        );
    END IF;
    
    RETURN NEW;
END;
$function$

-- Create trigger for profile verification changes
CREATE TRIGGER profile_verification_change
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_verification_status_change();

-- Enable realtime for profiles table for verification updates
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;