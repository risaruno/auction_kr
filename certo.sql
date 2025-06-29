-- CREATE SCHEMA "auth";

-- CREATE TABLE "auth"."users" (
--   "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
--   "email" varchar UNIQUE NOT NULL,
--   "phone" varchar UNIQUE,
--   "raw_user_meta_data" jsonb,
--   "created_at" timestamptz NOT NULL DEFAULT (now())
-- );

-- Create the admin role enum first
CREATE TYPE "admin_role" AS ENUM (
  'super_admin',
  'content_manager',
  'customer_support',
  'expert',
  'user'
);

CREATE TABLE "profiles" (
  "id" uuid PRIMARY KEY,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "edited_at" timestamptz DEFAULT null,
  "full_name" text NOT NULL,
  "phone" text,
  "email" text UNIQUE,
  "address" text,
  "addr_detail" text,
  "bank" text,
  "account_number" text,
  "admin_role" admin_role DEFAULT 'user'
);

CREATE TABLE "experts" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "edited_at" timestamptz DEFAULT null,
  "name" text NOT NULL,
  "location" text NOT NULL,
  "photo_url" text,
  "description" text,
  "bio" text,
  "office_address" text,
  "services" text[],
  "is_active" boolean NOT NULL DEFAULT true,
  "user_id" uuid
);

CREATE TABLE "bidding_applications" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "edited_at" timestamp DEFAULT (now()),
  "user_id" uuid NOT NULL,
  "expert_id" uuid,
  "case_number" text NOT NULL,
  "court_name" text,
  "bid_date" date,
  "bid_amount" numeric(15,2),
  "evaluation_amount" decimal(15,2),
  "lowest_bid_amount" decimal(15,2),
  "deposit_amount" decimal(15,2),
  "account_number" text,
  "account_holder" text,
  "bidder_name" text,
  "resident_id1" text,
  "resident_id2" text,
  "phone_number" text,
  "zip_code" text,
  "road_address" text,
  "address_detail" text,
  "company_name" text,
  "business_number" text,
  "representative_name" text,
  "company_phone" text,
  "company_zip_code" text,
  "company_road_address" text,
  "company_address_detail" text,
  "group_representative_name" text,
  "group_representative_id1" text,
  "group_representative_id2" text,
  "group_member_count" integer,
  "group_phone_number" text,
  "group_zip_code" text,
  "group_road_address" text,
  "group_address_detail" text,
  "service_fee" numeric(10,2) DEFAULT 100000,
  "application_type" text NOT NULL,
  "status" text NOT NULL DEFAULT 'new',
  "payment_status" text DEFAULT 'pending',
  "deposit_status" text DEFAULT 'pending',
  "result" text
);

CREATE TABLE "service_applications" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "edited_at" timestamptz DEFAULT null,
  "user_id" uuid NOT NULL,
  "expert_id" uuid,
  "case_number" text NOT NULL,
  "court_name" text,
  "bid_date" date,
  "bid_amount" numeric(15,2),
  "service_fee" numeric(10,2) DEFAULT 100000,
  "payment_status" text DEFAULT 'Pending',
  "deposit_status" text DEFAULT 'Pending',
  "status" text NOT NULL DEFAULT 'New Application',
  "result" text
);

CREATE TABLE "inquiries" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "user_id" uuid NOT NULL,
  "title" text NOT NULL,
  "status" text NOT NULL DEFAULT 'New'
);

CREATE TABLE "inquiry_messages" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "edited_at" timestamptz DEFAULT null,
  "inquiry_id" uuid NOT NULL,
  "sender_id" uuid NOT NULL,
  "content" text NOT NULL
);

CREATE TABLE "faqs" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "edited_at" timestamptz DEFAULT null,
  "question" text UNIQUE NOT NULL,
  "answer" text NOT NULL,
  "category" text NOT NULL,
  "display_order" int NOT NULL DEFAULT 0,
  "is_published" boolean NOT NULL DEFAULT true
);

COMMENT ON TABLE "profiles" IS 'Stores public-facing or non-sensitive user data.';

COMMENT ON TABLE "experts" IS 'Stores information about the experts shown on the site.';

COMMENT ON COLUMN "experts"."user_id" IS 'Links to a user account for the expert portal';

COMMENT ON TABLE "bidding_applications" IS 'The core table tracking each proxy bidding case.';

COMMENT ON COLUMN "bidding_applications"."application_type" IS 'personal, company, group';

COMMENT ON COLUMN "bidding_applications"."status" IS 'new, pending, approved, rejected, completed, cancelled';

COMMENT ON COLUMN "bidding_applications"."payment_status" IS 'pending, paid, failed, refunded';

COMMENT ON COLUMN "bidding_applications"."deposit_status" IS 'pending, confirmed, returned';

COMMENT ON TABLE "service_applications" IS 'The core table tracking each proxy bidding case.';

COMMENT ON TABLE "inquiries" IS 'A thread for a single 1:1 inquiry.';

COMMENT ON TABLE "inquiry_messages" IS 'A single message within an inquiry thread.';

COMMENT ON COLUMN "inquiry_messages"."sender_id" IS 'Can be a user or an admin';

COMMENT ON TABLE "faqs" IS 'Stores the content for the public FAQ page.';

COMMENT ON TABLE "auth"."users" IS 'Managed by Supabase Auth. Stores login credentials.';

ALTER TABLE "profiles" ADD FOREIGN KEY ("id") REFERENCES "auth"."users" ("id");

ALTER TABLE "experts" ADD FOREIGN KEY ("user_id") REFERENCES "auth"."users" ("id");

ALTER TABLE "bidding_applications" ADD FOREIGN KEY ("user_id") REFERENCES "profiles" ("id");

ALTER TABLE "bidding_applications" ADD FOREIGN KEY ("expert_id") REFERENCES "experts" ("id");

ALTER TABLE "service_applications" ADD FOREIGN KEY ("user_id") REFERENCES "profiles" ("id");

ALTER TABLE "service_applications" ADD FOREIGN KEY ("expert_id") REFERENCES "experts" ("id");

ALTER TABLE "inquiries" ADD FOREIGN KEY ("user_id") REFERENCES "profiles" ("id");

ALTER TABLE "inquiry_messages" ADD FOREIGN KEY ("inquiry_id") REFERENCES "inquiries" ("id");

ALTER TABLE "inquiry_messages" ADD FOREIGN KEY ("sender_id") REFERENCES "auth"."users" ("id");
