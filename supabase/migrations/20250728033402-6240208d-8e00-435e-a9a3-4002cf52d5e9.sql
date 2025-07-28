-- Drop the old duplicate trigger to avoid conflicts
DROP TRIGGER IF EXISTS notify_message_trigger ON messages;

-- Keep only the notify_new_message trigger which we just updated