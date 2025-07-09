# Fixing Authentication Issues - Admin Roles Migration

## Problem
You're getting the error: `column profiles.admin_role does not exist`

This happens when:
1. Users registered before the profiles table was properly set up
2. The database migration hasn't been applied yet
3. The profiles table exists but doesn't have the admin_role column

## Solution

### Option 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Initialize Supabase in your project** (if not already done):
   ```bash
   supabase init
   ```

3. **Link to your Supabase project**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. **Apply the migration**:
   - On Windows: Run `apply_migration.bat`
   - On Mac/Linux: Run `./apply_migration.sh`

### Option 2: Manual Database Update

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the entire contents of `migration_add_admin_roles.sql`**
4. **Click "Run"**

### Option 3: Quick Fix for Development

If you just want to get the app working quickly, you can temporarily update the AuthContext to handle missing columns gracefully (this is already done in the latest code).

## What the Migration Does

1. **Creates the admin_role enum** with values: `super_admin`, `content_manager`, `customer_support`, `expert`, `user`
2. **Creates or updates the profiles table** with the admin_role column
3. **Creates profiles for existing users** who don't have them yet
4. **Sets default admin_role to 'user'** for all existing users
5. **Sets up Row Level Security (RLS) policies** for proper access control
6. **Creates a trigger** to automatically create profiles for new users

## Verification

After running the migration, verify it worked:

1. Go to Supabase Dashboard > Table Editor
2. Check the `profiles` table has an `admin_role` column
3. Check that all existing users have profiles with `admin_role = 'user'`
4. Test logging in - you should no longer get the column error

## Creating Your First Admin User

After the migration, create your first admin user:

1. **Go to Supabase Dashboard > SQL Editor**
2. **Run this query** (replace with your email):
   ```sql
   UPDATE profiles 
   SET admin_role = 'super_admin' 
   WHERE email = 'your-email@example.com';
   ```

## Troubleshooting

### If you still get authentication issues:

1. **Clear browser cache and localStorage**
2. **Use the Debug Auth component** (should show in development mode)
3. **Check browser console** for detailed error messages
4. **Verify your Supabase environment variables** in `.env.local`

### If the migration fails:

1. Check your Supabase project permissions
2. Make sure you're connected to the right project
3. Try running the SQL manually in the Supabase dashboard

### If users can't access protected pages:

1. Check the console logs in the Debug Auth component
2. Verify the middleware configuration
3. Make sure the AuthContext is properly wrapped around your app

## Environment Variables

Make sure you have these in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Support

If you continue to have issues:
1. Check the browser console for detailed error messages
2. Use the Debug Auth component to see the authentication state
3. Verify your Supabase configuration and database schema
