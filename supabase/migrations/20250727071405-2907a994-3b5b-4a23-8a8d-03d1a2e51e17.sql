-- Fix duplicate notification triggers by dropping and recreating properly
DROP TRIGGER IF EXISTS send_message_notification ON messages;
DROP FUNCTION IF EXISTS send_message_notification();

-- Create a better message notification function that prevents duplicates
CREATE OR REPLACE FUNCTION send_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for the receiver only if they're different from sender
  IF NEW.receiver_id != NEW.sender_id THEN
    INSERT INTO notifications (
      user_id,
      type,
      category,
      message,
      target_url
    ) VALUES (
      NEW.receiver_id,
      'message',
      'communication',
      'You have a new message',
      '/bookings/' || NEW.booking_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a single trigger that fires after insert
CREATE TRIGGER send_message_notification
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION send_message_notification();