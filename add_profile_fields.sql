-- Add bank and account_number fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bank text,
ADD COLUMN IF NOT EXISTS account_number text;

-- Update the profiles table to ensure all fields exist
-- (This is safe to run multiple times)
