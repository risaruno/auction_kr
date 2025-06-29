-- Migration script to add admin_role support to existing database
-- This script handles the case where users already exist but the profiles table needs updating

-- Step 1: Create the admin_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM (
        'super_admin',
        'content_manager', 
        'customer_support',
        'expert',
        'user'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Check if profiles table exists, if not create it
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    edited_at timestamptz DEFAULT null,
    full_name text,
    phone text,
    email text,
    address text,
    addr_detail text,
    admin_role admin_role DEFAULT 'user'
);

-- Step 3: Add admin_role column if it doesn't exist
DO $$ BEGIN
    ALTER TABLE profiles ADD COLUMN admin_role admin_role DEFAULT 'user';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Step 4: Create profiles for existing auth.users who don't have profiles yet
INSERT INTO profiles (id, email, full_name, admin_role)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', ''),
    'user'::admin_role
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = au.id
)
AND au.email IS NOT NULL;

-- Step 5: Update existing profiles to have admin_role if it's null
UPDATE profiles 
SET admin_role = 'user'::admin_role 
WHERE admin_role IS NULL;

-- Step 6: Create RLS policies if they don't exist
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own profile
DO $$ BEGIN
    CREATE POLICY "Users can view own profile" ON profiles
        FOR SELECT USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Policy for users to update their own profile
DO $$ BEGIN
    CREATE POLICY "Users can update own profile" ON profiles
        FOR UPDATE USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Policy for admins to view all profiles
DO $$ BEGIN
    CREATE POLICY "Admins can view all profiles" ON profiles
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND admin_role IN ('super_admin', 'content_manager', 'customer_support')
            )
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Policy for super admins to update any profile
DO $$ BEGIN
    CREATE POLICY "Super admins can update any profile" ON profiles
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND admin_role = 'super_admin'
            )
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, admin_role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', ''),
        'user'::admin_role
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration if it doesn't exist
DO $$ BEGIN
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Verify the migration
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN admin_role = 'user' THEN 1 END) as regular_users,
    COUNT(CASE WHEN admin_role IN ('super_admin', 'content_manager', 'customer_support') THEN 1 END) as admin_users
FROM profiles;
