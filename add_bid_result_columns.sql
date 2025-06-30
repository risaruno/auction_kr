-- Add missing columns for bid result functionality
-- This adds the result_notes column to store detailed bid results

-- Add result_notes column to bidding_applications table
ALTER TABLE "bidding_applications" 
ADD COLUMN IF NOT EXISTS "result_notes" text;

-- Add comments to explain the columns
COMMENT ON COLUMN "bidding_applications"."result" IS 'Overall result of the bid (successful, failed, etc.)';
COMMENT ON COLUMN "bidding_applications"."result_notes" IS 'Detailed notes about the bid result, including successful bid amount and other details';

-- Verify the changes
SELECT 
  'Bid result columns added successfully' as status,
  COUNT(*) as total_bidding_applications
FROM bidding_applications;
