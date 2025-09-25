-- Temporarily disable the trigger to test message sending
DROP TRIGGER IF EXISTS notify_new_message ON messages;

-- Test inserting a message directly to see if the basic functionality works
-- We'll re-add the trigger after testing