-- Add first_login_completed field to track if user has completed their first login
ALTER TABLE public.profiles 
ADD COLUMN first_login_completed boolean DEFAULT false;