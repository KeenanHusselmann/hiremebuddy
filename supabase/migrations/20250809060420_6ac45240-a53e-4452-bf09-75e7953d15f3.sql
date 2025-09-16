-- Create trigger to generate notifications on new messages
-- Drop existing trigger if it exists to avoid duplicates
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_notify_new_message_on_insert'
  ) THEN
    DROP TRIGGER trg_notify_new_message_on_insert ON public.messages;
  END IF;
END$$;

-- Create AFTER INSERT trigger to call the notification function
CREATE TRIGGER trg_notify_new_message_on_insert
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_message();
