-- Remove any duplicate triggers that might exist
DROP TRIGGER IF EXISTS notify_message_trigger ON messages;
DROP TRIGGER IF EXISTS notify_new_message_trigger ON messages;
DROP TRIGGER IF EXISTS message_notification_trigger ON messages;

-- Create a single, clean trigger
CREATE TRIGGER notify_message_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_message();