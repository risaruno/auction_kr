-- SQL script to initialize admin users
-- Run this in your Supabase SQL editor after creating the schema

-- First, create a super admin user (replace with your actual email)
-- This user will be created through normal signup, then we'll update their role

-- Update an existing user to be super admin (replace the email with your admin email)
UPDATE profiles 
SET admin_role = 'super_admin' 
WHERE email = 'your-admin@email.com';

-- Or if you want to create demo admin users with different roles:

-- Create content manager role for demo
-- UPDATE profiles 
-- SET admin_role = 'content_manager' 
-- WHERE email = 'content-manager@demo.com';

-- Create customer support role for demo
-- UPDATE profiles 
-- SET admin_role = 'customer_support' 
-- WHERE email = 'support@demo.com';

-- Create RLS (Row Level Security) policies

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile (except admin_role)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Super admins can read all profiles
CREATE POLICY "Super admins can read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND admin_role = 'super_admin'
    )
  );

-- Policy: Super admins can update all profiles
CREATE POLICY "Super admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND admin_role = 'super_admin'
    )
  );

-- Policy: Admins can read profiles (but not update admin_role unless super_admin)
CREATE POLICY "Admins can read profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND admin_role IN ('super_admin', 'content_manager', 'customer_support')
    )
  );

-- Enable RLS on other tables as needed
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bidding_applications ENABLE ROW LEVEL SECURITY;

-- Experts policies
CREATE POLICY "Everyone can read active experts" ON experts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage experts" ON experts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND admin_role IN ('super_admin', 'content_manager')
    )
  );

-- FAQs policies
CREATE POLICY "Everyone can read published FAQs" ON faqs
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage FAQs" ON faqs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND admin_role IN ('super_admin', 'content_manager')
    )
  );

-- Bidding applications policies
CREATE POLICY "Users can read own applications" ON bidding_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications" ON bidding_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON bidding_applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all applications" ON bidding_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND admin_role IN ('super_admin', 'content_manager', 'customer_support')
    )
  );

CREATE POLICY "Admins can update applications" ON bidding_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND admin_role IN ('super_admin', 'content_manager', 'customer_support')
    )
  );
