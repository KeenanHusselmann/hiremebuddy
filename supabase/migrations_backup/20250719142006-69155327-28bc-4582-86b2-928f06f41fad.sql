-- Clean all dummy/test data from the database
-- This will remove all existing providers, services, bookings, reviews, and related data
-- to give new users a clean slate

-- Delete all reviews (must be done first due to foreign key constraints)
DELETE FROM public.reviews;

-- Delete all messages
DELETE FROM public.messages;

-- Delete all bookings  
DELETE FROM public.bookings;

-- Delete all services
DELETE FROM public.services;

-- Delete all notifications
DELETE FROM public.notifications;

-- Delete all user presence records
DELETE FROM public.user_presence;

-- Delete all profiles (but keep the structure)
DELETE FROM public.profiles;