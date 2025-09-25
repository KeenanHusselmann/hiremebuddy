-- Deduplicate quote_requests notification triggers
-- Drop legacy/duplicate trigger names if they exist
DROP TRIGGER IF EXISTS notify_new_quote_request ON public.quote_requests;
DROP TRIGGER IF EXISTS notify_quote_request_created ON public.quote_requests;
DROP TRIGGER IF EXISTS notify_quote_response ON public.quote_requests;
DROP TRIGGER IF EXISTS notify_quote_accepted ON public.quote_requests;

-- Also drop our current ones before recreating to ensure idempotency
DROP TRIGGER IF EXISTS trg_notify_new_quote_request ON public.quote_requests;
DROP TRIGGER IF EXISTS trg_notify_quote_response ON public.quote_requests;
DROP TRIGGER IF EXISTS trg_notify_quote_accepted ON public.quote_requests;

-- Recreate a single, consistent set of triggers
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