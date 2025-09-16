-- Remove all preloaded subcategories (where created_by is NULL)
DELETE FROM service_subcategories WHERE created_by IS NULL;

-- Ensure the notify_new_message trigger is properly set up
DROP TRIGGER IF EXISTS notify_message_trigger ON messages;

CREATE TRIGGER notify_message_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_message();