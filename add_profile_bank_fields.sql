-- Add missing fields to profiles table for user info functionality
ALTER TABLE "profiles" 
ADD COLUMN IF NOT EXISTS "bank" text,
ADD COLUMN IF NOT EXISTS "account_number" text;

-- Add comments for the new columns
COMMENT ON COLUMN "profiles"."bank" IS 'Bank name for refund account';
COMMENT ON COLUMN "profiles"."account_number" IS 'Account number for refund account';
