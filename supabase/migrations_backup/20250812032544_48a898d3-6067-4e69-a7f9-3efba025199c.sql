-- Security hardening migration
-- 1) Enforce non-admin restriction on sensitive profile fields
DROP TRIGGER IF EXISTS trg_enforce_profile_update_restrictions ON public.profiles;
CREATE TRIGGER trg_enforce_profile_update_restrictions
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_profile_update_restrictions();

-- 2) Notify users on verification status change
DROP TRIGGER IF EXISTS trg_notify_verification_status_change ON public.profiles;
CREATE TRIGGER trg_notify_verification_status_change
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.notify_verification_status_change();

-- 3) Robust message notifications (deduplicate legacy triggers)
DROP TRIGGER IF EXISTS notify_new_message ON public.messages;
DROP TRIGGER IF EXISTS trg_create_message_notification ON public.messages;
DROP TRIGGER IF EXISTS trg_notify_new_message ON public.messages;
CREATE TRIGGER trg_notify_new_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_message();

-- 4) Booking notifications (new booking + status change)
DROP TRIGGER IF EXISTS trg_notify_new_booking ON public.bookings;
DROP TRIGGER IF EXISTS trg_notify_booking_status_change ON public.bookings;
CREATE TRIGGER trg_notify_new_booking
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_booking();

CREATE TRIGGER trg_notify_booking_status_change
AFTER UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_booking_status_change();

-- 5) Deduplicate and recreate quote request notification triggers
DROP TRIGGER IF EXISTS notify_new_quote_request ON public.quote_requests;
DROP TRIGGER IF EXISTS notify_quote_request_created ON public.quote_requests;
DROP TRIGGER IF EXISTS notify_quote_response ON public.quote_requests;
DROP TRIGGER IF EXISTS notify_quote_accepted ON public.quote_requests;

DROP TRIGGER IF EXISTS trg_notify_new_quote_request ON public.quote_requests;
DROP TRIGGER IF EXISTS trg_notify_quote_response ON public.quote_requests;
DROP TRIGGER IF EXISTS trg_notify_quote_accepted ON public.quote_requests;

CREATE TRIGGER trg_notify_new_quote_request
AFTER INSERT ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_quote_request();

CREATE TRIGGER trg_notify_quote_response
AFTER UPDATE ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_quote_response();

CREATE TRIGGER trg_notify_quote_accepted
AFTER UPDATE ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_quote_accepted();