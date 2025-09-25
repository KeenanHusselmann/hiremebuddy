-- Create trigger for profile verification changes
CREATE TRIGGER profile_verification_change
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_verification_status_change();