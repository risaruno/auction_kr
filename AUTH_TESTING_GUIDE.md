# Authentication Flow Testing Guide

## Overview
All authentication has been refactored from API routes to Next.js Server Actions for better type safety and performance. The complete flow includes:

1. **Sign Up** - Register new user with email confirmation
2. **Email Confirmation** - Verify email via link 
3. **Sign In** - Login with credentials
4. **Find Password** - Request password reset
5. **Update Password** - Set new password via email link
6. **Logout** - Sign out user

## Authentication Flow

### 1. Sign Up Process
**File**: `src/app/sign/up/page.tsx`
**Action**: `signup` in `src/app/sign/actions.ts`

**Testing Steps**:
1. Navigate to `/sign/up`
2. Fill in name, email, and password (8-16 characters)
3. Click "가입하기"
4. Should show success message: "Sign-up successful! Please check your email to verify your account."
5. Check email for verification link

**Server Action**: 
- Validates input fields (email format, password length 8-16 chars)
- Creates user with Supabase `signUp()`
- Stores full name in user metadata
- Sends confirmation email automatically

### 2. Email Confirmation
**File**: `src/app/auth/confirm/route.ts`

**Testing Steps**:
1. Click verification link from signup email
2. Should redirect to home page or specified redirect URL
3. User is now confirmed and can sign in

**Route Handler**:
- Extracts token from URL params
- Calls `supabase.auth.verifyOtp()` 
- Redirects on success, error page on failure

### 3. Sign In Process  
**File**: `src/app/sign/in/page.tsx`
**Action**: `login` in `src/app/sign/actions.ts`

**Testing Steps**:
1. Navigate to `/sign/in`
2. Enter confirmed email and password
3. Click "로그인"
4. Should redirect to `/auth/user/history` on success
5. Invalid credentials show error message

**Server Action**:
- Validates email/password fields (email format, password length 8-16 chars)
- Calls `supabase.auth.signInWithPassword()`
- Revalidates layout and redirects on success

### 4. Find Password Process
**File**: `src/app/sign/find-password/page.tsx` 
**Action**: `findPassword` in `src/app/sign/actions.ts`

**Testing Steps**:
1. Navigate to `/sign/find-password`
2. Enter email address
3. Click "비밀번호 재설정 링크 보내기"
4. Should show success message (even for non-existent emails for security)
5. Check email for password reset link

**Server Action**:
- Validates email input (format validation)
- Calls `supabase.auth.resetPasswordForEmail()`
- Sets redirect URL to `/sign/update-password`
- Always returns success message (security)

### 5. Update Password Process
**File**: `src/app/sign/update-password/page.tsx`
**Action**: `updatePassword` in `src/app/sign/actions.ts`

**Testing Steps**:
1. Click password reset link from email
2. Should navigate to `/sign/update-password` with auth tokens
3. Enter new password and confirmation (8-16 characters)
4. Click "비밀번호 변경하기"
5. Should show success message with login button
6. Click "로그인 페이지로 이동" to go to sign in

**Server Action**:
- Validates password and confirmation match
- Checks password length (8-16 characters)
- Verifies user authentication via `supabase.auth.getUser()`
- Calls `supabase.auth.updateUser()` with new password
- Returns success message (no automatic redirect)

### 6. Logout Process
**Action**: `logout` in `src/app/sign/actions.ts`

**Usage**: 
```tsx
import { logout } from '@/app/sign/actions'

// In a component:
<form action={logout}>
  <button type="submit">로그아웃</button>
</form>
```

**Server Action**:
- Calls `supabase.auth.signOut()`
- Revalidates layout and redirects to home

## Environment Setup

### Required Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Supabase Configuration
1. **Email Templates**: Configure in Supabase Dashboard → Authentication → Email Templates
2. **Redirect URLs**: Add your domain to allowed redirect URLs
3. **Email Provider**: Configure SMTP or use Supabase's default

## Error Handling

### Common Error Messages
- **"Email and password are required"** - Missing form fields
- **"Please enter a valid email address"** - Invalid email format
- **"Password must be between 8 and 16 characters long"** - Password validation
- **"Invalid credentials. Please try again."** - Wrong email/password
- **"Passwords do not match"** - Password confirmation mismatch
- **"Authentication required. Please use the password reset link from your email."** - Invalid reset session
- **"Failed to update password. Please try the reset link again."** - Invalid reset token

### Security Features
- Generic success messages for password reset (prevents user enumeration)
- Password complexity validation (8-16 characters)
- Email format validation
- Email confirmation required for new accounts
- Secure authentication verification using `supabase.auth.getUser()`
- Secure token handling for password resets

## Testing Checklist

### Full Authentication Flow Test
- [ ] Sign up with new email
- [ ] Receive and click confirmation email
- [ ] Sign in with confirmed account
- [ ] Request password reset
- [ ] Receive and click reset email  
- [ ] Set new password
- [ ] Sign in with new password
- [ ] Logout successfully

### Error Scenarios
- [ ] Sign up with invalid email format
- [ ] Sign up with short password (less than 8 chars)
- [ ] Sign up with long password (more than 16 chars)
- [ ] Sign in with wrong credentials
- [ ] Sign in with invalid email format
- [ ] Sign in before email confirmation
- [ ] Password reset with non-existent email
- [ ] Password reset with invalid email format
- [ ] Update password with mismatched confirmation
- [ ] Update password with invalid length
- [ ] Access update password page without proper authentication

## Migration from API Routes

### Removed Files
These API routes have been replaced with server actions:
- `src/pages/api/auth/sign-up.ts` → `signup` action
- `src/pages/api/auth/sign-in.ts` → `login` action  
- `src/pages/api/auth/find-password.ts` → `findPassword` action
- `src/pages/api/auth/update-password.ts` → `updatePassword` action

### Benefits of Server Actions
- **Type Safety**: Better TypeScript integration
- **Performance**: Server-side execution, no API round trips
- **Simplicity**: Direct function calls instead of fetch requests
- **Error Handling**: Structured error/success states
- **Progressive Enhancement**: Works without JavaScript
