-- Remove the old problematic trigger that uses 'communication' category
DROP TRIGGER IF EXISTS send_message_notification ON messages;

-- Also remove the old function since it has the wrong category
DROP FUNCTION IF EXISTS send_message_notification();