-- First let's test if we can create a simple notification manually
INSERT INTO notifications (user_id, type, message, category, target_url)
VALUES (
  '1edb8fa9-8bcf-447d-9dbd-08cf131f70d0',
  'test_message',
  'Test notification from manual insert',
  'message',
  '/test'
);