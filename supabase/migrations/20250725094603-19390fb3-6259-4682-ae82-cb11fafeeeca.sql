-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS notify_message_trigger ON messages;

-- Create new trigger for message notifications
CREATE TRIGGER notify_message_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_message();