# Role-Based Authentication Implementation Guide

## Overview

This implementation provides a comprehensive role-based authentication system integrated with Supabase Auth and your PostgreSQL database.

## Database Schema Changes

### 1. Updated Profiles Table
```sql
CREATE TYPE "admin_role" AS ENUM (
  'super_admin',
  'content_manager', 
  'customer_support',
  'expert',
  'user'
);

-- Added admin_role column to profiles table
ALTER TABLE profiles ADD COLUMN admin_role admin_role DEFAULT 'user';
```

### 2. Role Hierarchy
- **super_admin**: Full access to everything, can manage other admins
- **content_manager**: Can manage content (FAQs, experts), handle support
- **customer_support**: Can handle inquiries and view bidding applications
- **expert**: Expert users (if needed for expert portal)
- **user**: Regular users

## Middleware Protection

### 1. Authentication Check
The middleware now properly checks for authenticated users on protected routes:
- `/auth/manage/*` - Admin routes
- `/auth/user/*` - User dashboard routes  
- `/apply-bid/*` - Bidding application routes
- `/checkout/*` - Checkout routes

### 2. Role-Based Access Control
- Admin routes (`/auth/manage/*`) require admin roles
- Users without admin roles are redirected to `/auth/user`
- Unauthenticated users are redirected to `/sign/in`

## Components and Hooks

### 1. AuthContext (`/src/contexts/AuthContext.tsx`)
Provides user authentication state and role information throughout the app.

```tsx
import { useAuth, useIsAdmin, useIsSuperAdmin } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, loading } = useAuth()
  const isAdmin = useIsAdmin()
  const isSuperAdmin = useIsSuperAdmin()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      <p>Welcome {user?.full_name}</p>
      {isAdmin && <p>You have admin access</p>}
      {isSuperAdmin && <p>You are a super admin</p>}
    </div>
  )
}
```

### 2. RequireAuth Component (`/src/components/auth/RequireAuth.tsx`)
Protects components based on authentication and roles.

```tsx
import { RequireAuth, RequireAdmin, RequireSuperAdmin } from '@/components/auth/RequireAuth'

// Require any authenticated user
<RequireAuth>
  <UserDashboard />
</RequireAuth>

// Require admin role
<RequireAdmin>
  <AdminPanel />
</RequireAdmin>

// Require super admin role
<RequireSuperAdmin>
  <UserManagement />
</RequireSuperAdmin>

// Require specific role
<RequireAuth requiredRole={['super_admin', 'content_manager']}>
  <ContentManagement />
</RequireAuth>
```

### 3. Permission Hooks
```tsx
import { usePermissions } from '@/components/auth/RequireAuth'

function AdminSidebar() {
  const permissions = usePermissions()
  
  return (
    <div>
      {permissions.canManageUsers && <UserManagementLink />}
      {permissions.canManageContent && <ContentManagementLink />}
      {permissions.canHandleSupport && <SupportLink />}
    </div>
  )
}
```

## Server-Side Role Utilities

### 1. Role Checking Functions (`/src/utils/auth/roles.ts`)
```tsx
import { 
  getCurrentUserWithRole, 
  isAdmin, 
  isSuperAdmin, 
  canManageContent 
} from '@/utils/auth/roles'

// In server actions or API routes
export async function someServerAction() {
  const user = await getCurrentUserWithRole()
  
  if (!user || !isAdmin(user.admin_role)) {
    throw new Error('Unauthorized')
  }
  
  // Proceed with admin action
}
```

### 2. Server Actions Protection
```tsx
'use server'

import { getCurrentUserWithRole, canManageContent } from '@/utils/auth/roles'

export async function updateFAQ(id: string, data: FAQData) {
  const user = await getCurrentUserWithRole()
  
  if (!user || !canManageContent(user.admin_role)) {
    throw new Error('You do not have permission to manage content')
  }
  
  // Proceed with update
}
```

## Setup Instructions

### 1. Database Setup
1. Run the updated schema in `cetro.sql`
2. Run the admin initialization script in `init-admin.sql`
3. Update your admin email in the script before running

### 2. Application Setup
1. The middleware is already configured
2. The AuthProvider is added to the root layout
3. Admin routes are protected with RequireAdmin

### 3. Create Your First Admin
```sql
-- In Supabase SQL editor, after a user signs up with your admin email:
UPDATE profiles 
SET admin_role = 'super_admin' 
WHERE email = 'your-admin@email.com';
```

### 4. Row Level Security (RLS)
The init-admin.sql script includes RLS policies that:
- Allow users to manage their own data
- Allow admins to access admin functions
- Protect sensitive operations to appropriate roles

## Usage Examples

### 1. Conditional Rendering in Components
```tsx
function AdminDashboard() {
  const permissions = usePermissions()
  
  return (
    <div>
      {permissions.canManageUsers && (
        <Button href="/auth/manage/users">
          User Management
        </Button>
      )}
      
      {permissions.canManageContent && (
        <Button href="/auth/manage/faqs">
          FAQ Management  
        </Button>
      )}
    </div>
  )
}
```

### 2. Server Action with Role Check
```tsx
'use server'

export async function deleteUser(userId: string) {
  const currentUser = await getCurrentUserWithRole()
  
  if (!currentUser || !isSuperAdmin(currentUser.admin_role)) {
    throw new Error('Only super admins can delete users')
  }
  
  // Proceed with deletion
}
```

### 3. API Route Protection
```tsx
// In API routes
import { getCurrentUserWithRole, isAdmin } from '@/utils/auth/roles'

export async function GET() {
  const user = await getCurrentUserWithRole()
  
  if (!user || !isAdmin(user.admin_role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Return admin data
}
```

## Security Features

1. **Middleware Protection**: Routes are protected at the middleware level
2. **Component Protection**: UI components check roles before rendering
3. **Server Action Protection**: Backend operations verify roles
4. **Database RLS**: PostgreSQL policies enforce data access rules
5. **Type Safety**: TypeScript ensures role types are used correctly

## Testing the Implementation

1. Sign up a new user account
2. Update their role to `super_admin` in the database
3. Navigate to `/auth/manage` - should work
4. Create another user and try to access admin routes - should redirect
5. Test different role combinations to verify permissions

This implementation provides a robust, secure, and scalable role-based authentication system for your auction application.
