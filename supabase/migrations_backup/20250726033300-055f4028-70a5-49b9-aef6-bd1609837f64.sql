-- Check if the trigger exists and recreate it properly
DROP TRIGGER IF EXISTS notify_message_trigger ON messages;

-- Recreate the trigger
CREATE TRIGGER notify_message_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_message();

-- Test the trigger by inserting a test message
INSERT INTO messages (
    booking_id, 
    sender_id, 
    receiver_id, 
    content, 
    message_type
) VALUES (
    'd1bc8c54-1028-44aa-a2ef-9e1765c99696',
    'ad97bc18-d3c7-4f39-8349-c9b84023ae62',
    '1edb8fa9-8bcf-447d-9dbd-08cf131f70d0',
    'Test message to trigger notification',
    'text'
);