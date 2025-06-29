-- Updated database schema to include missing fields for proper form data storage
-- This adds the missing fields identified when comparing FormData interface with database schema

-- Add missing columns to bidding_applications table
ALTER TABLE "bidding_applications" 
ADD COLUMN IF NOT EXISTS "bank_name" text,
ADD COLUMN IF NOT EXISTS "verification_phone_verified" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "verification_otp_code" text,
ADD COLUMN IF NOT EXISTS "electronic_signature" text,
ADD COLUMN IF NOT EXISTS "terms_agreed" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "points_used" numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "actual_service_fee" numeric(10,2) DEFAULT 100000,
ADD COLUMN IF NOT EXISTS "fee_payment_timing" text DEFAULT '대리입찰 접수 시',
ADD COLUMN IF NOT EXISTS "created_by_user_id" uuid;

-- Create a separate table for group members (for group applications)
CREATE TABLE IF NOT EXISTS "group_members" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "bidding_application_id" uuid NOT NULL,
  "member_name" text NOT NULL,
  "member_resident_id1" text NOT NULL,
  "member_resident_id2" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

-- Add foreign key constraint for group members
ALTER TABLE "group_members" 
ADD CONSTRAINT "fk_group_members_bidding_application" 
FOREIGN KEY ("bidding_application_id") REFERENCES "bidding_applications" ("id") ON DELETE CASCADE;

-- Add foreign key constraint for created_by_user_id
ALTER TABLE "bidding_applications" 
ADD CONSTRAINT "fk_bidding_applications_created_by_user" 
FOREIGN KEY ("created_by_user_id") REFERENCES "auth"."users" ("id");

-- Update comments to reflect new columns
COMMENT ON COLUMN "bidding_applications"."bank_name" IS 'Name of the bank for deposit account';
COMMENT ON COLUMN "bidding_applications"."verification_phone_verified" IS 'Whether phone number has been verified via OTP';
COMMENT ON COLUMN "bidding_applications"."verification_otp_code" IS 'Temporary storage for OTP verification (should be cleared after verification)';
COMMENT ON COLUMN "bidding_applications"."electronic_signature" IS 'Base64 encoded electronic signature';
COMMENT ON COLUMN "bidding_applications"."terms_agreed" IS 'Whether user has agreed to terms and conditions';
COMMENT ON COLUMN "bidding_applications"."points_used" IS 'Points used for discount (if any)';
COMMENT ON COLUMN "bidding_applications"."actual_service_fee" IS 'Actual service fee charged (may differ from default due to discounts)';
COMMENT ON COLUMN "bidding_applications"."fee_payment_timing" IS 'When the fee should be paid';
COMMENT ON COLUMN "bidding_applications"."created_by_user_id" IS 'The user who created this application';

COMMENT ON TABLE "group_members" IS 'Stores individual members for group bidding applications';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_bidding_applications_created_by_user" ON "bidding_applications" ("created_by_user_id");
CREATE INDEX IF NOT EXISTS "idx_group_members_bidding_application" ON "group_members" ("bidding_application_id");

-- Add RLS policies for group_members table
ALTER TABLE "group_members" ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own group members
CREATE POLICY "Users can view own group members" ON "group_members"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM "bidding_applications" ba
    WHERE ba.id = "group_members"."bidding_application_id"
    AND ba.user_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- Policy for users to insert their own group members
CREATE POLICY "Users can insert own group members" ON "group_members"
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM "bidding_applications" ba
    WHERE ba.id = "group_members"."bidding_application_id"
    AND ba.user_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- Policy for admins to view all group members
CREATE POLICY "Admins can view all group members" ON "group_members"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND admin_role IN ('super_admin', 'content_manager', 'customer_support')
  )
);

-- Verify the changes
SELECT 
  'Schema update completed' as status,
  COUNT(*) as total_bidding_applications
FROM bidding_applications;

SELECT 
  'Group members table ready' as status,
  COUNT(*) as total_group_members
FROM group_members;
