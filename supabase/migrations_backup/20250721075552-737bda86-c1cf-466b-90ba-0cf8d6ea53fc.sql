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
$function$;