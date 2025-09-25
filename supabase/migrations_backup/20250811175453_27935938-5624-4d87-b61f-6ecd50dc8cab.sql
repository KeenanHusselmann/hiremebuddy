-- Fix notifications category check and add quote triggers

-- 1) Allow 'quote' category in notifications
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_category_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_category_check
  CHECK (category IN ('general','message','booking','system','quote'));

-- 2) Ensure quote triggers exist (idempotent)
DROP TRIGGER IF EXISTS trg_notify_new_quote_request ON public.quote_requests;
CREATE TRIGGER trg_notify_new_quote_request
AFTER INSERT ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_quote_request();

DROP TRIGGER IF EXISTS trg_notify_quote_response ON public.quote_requests;
CREATE TRIGGER trg_notify_quote_response
AFTER UPDATE ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_quote_response();

DROP TRIGGER IF EXISTS trg_notify_quote_accepted ON public.quote_requests;
CREATE TRIGGER trg_notify_quote_accepted
AFTER UPDATE ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_quote_accepted();