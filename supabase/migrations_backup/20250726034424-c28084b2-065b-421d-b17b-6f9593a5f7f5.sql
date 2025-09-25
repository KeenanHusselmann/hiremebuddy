-- Test the current trigger by sending a new message
INSERT INTO messages (
    booking_id, 
    sender_id, 
    receiver_id, 
    content, 
    message_type
) VALUES (
    'd1bc8c54-1028-44aa-a2ef-9e1765c99696',
    '1edb8fa9-8bcf-447d-9dbd-08cf131f70d0',
    'ad97bc18-d3c7-4f39-8349-c9b84023ae62',
    'Client to Provider test message',
    'text'
);