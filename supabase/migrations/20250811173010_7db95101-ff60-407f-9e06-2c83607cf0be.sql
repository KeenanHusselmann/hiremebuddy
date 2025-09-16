-- Triggers for quote_requests notifications
-- 1) Notify provider and client on new quote request
DROP TRIGGER IF EXISTS trg_notify_new_quote_request ON public.quote_requests;
CREATE TRIGGER trg_notify_new_quote_request
AFTER INSERT ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_quote_request();

-- 2) Notify client when provider responds with a quote amount
DROP TRIGGER IF EXISTS trg_notify_quote_response ON public.quote_requests;
CREATE TRIGGER trg_notify_quote_response
AFTER UPDATE ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_quote_response();

-- 3) Notify both parties when a quote is accepted
CREATE OR REPLACE FUNCTION public.notify_quote_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'accepted' THEN
    -- Notify provider
    PERFORM public.create_notification(
      NEW.labourer_id,
      'quote_accepted',
      'Your quote has been accepted. The client will contact you to schedule the work.',
      'quote',
      '/quote-requests/' || NEW.id
    );
    -- Notify client confirmation
    PERFORM public.create_notification(
      NEW.client_id,
      'quote_confirmed',
      'You accepted the provider quote. You can coordinate next steps.',
      'quote',
      '/quote-requests/' || NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_quote_accepted ON public.quote_requests;
CREATE TRIGGER trg_notify_quote_accepted
AFTER UPDATE ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_quote_accepted();