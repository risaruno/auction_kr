# Phone Number Verification for Signup

This implementation adds phone number verification with OTP (One-Time Password) to the signup process.

## Features

- **Phone Number Input**: Users must enter their phone number during signup
- **OTP Verification**: SMS-based OTP verification before signup completion
- **Real-time Validation**: Phone number format validation for Korean phone numbers
- **Secure Process**: Phone verification is required before account creation
- **User-friendly UI**: Clear status indicators and error messages

## Implementation Details

### Files Modified/Created

1. **`src/app/api/auth/phone/actions.ts`** - Phone OTP server actions
   - `sendPhoneOtp()` - Sends OTP to phone number
   - `verifyPhoneOtp()` - Verifies OTP code

2. **`src/app/(auth)/sign/up/page.tsx`** - Updated signup page
   - Added phone number input field
   - Added OTP verification component
   - Disabled signup until phone is verified

3. **`src/app/api/auth/sign/actions.ts`** - Updated signup action
   - Added phone number validation
   - Added phone verification requirement
   - Store phone number in user profile

4. **`add_phone_verification_fields.sql`** - Database migration
   - Added phone verification fields to profiles table

### Phone Number Format

- Accepts Korean phone numbers in format: `010-1234-5678`
- Automatically converts to international format: `+8210-1234-5678`
- Validates format before sending OTP

### User Flow

1. User enters name, email, password, and phone number
2. User clicks "인증번호 발송" (Send Verification Code)
3. System sends OTP via SMS to the phone number
4. User enters the 6-digit OTP code
5. User clicks "인증확인" (Verify Code)
6. System verifies OTP and marks phone as verified
7. User can now complete signup with "가입하기" (Sign Up)

### Security Features

- Phone verification is mandatory before signup
- OTP expires automatically (handled by Supabase)
- Phone number is stored with verification status
- Immediate signout after OTP verification to prevent session hijacking

### UI Components

- **Phone Input Field**: With integrated "Send OTP" button
- **OTP Input Field**: Appears after OTP is sent
- **Status Indicators**: Success/error messages and loading states
- **Signup Button**: Disabled until phone is verified

### Error Handling

- Invalid phone number format
- OTP sending failures
- OTP verification failures
- Network errors
- Database errors

## Testing

To test the phone verification:

1. Navigate to `/sign/up`
2. Fill in required fields including phone number
3. Click "인증번호 발송" 
4. Enter the received OTP
5. Click "인증확인"
6. Complete signup

## Configuration

Make sure your Supabase project has:
- Auth configured with phone providers
- SMS provider configured (e.g., Twilio)
- Proper rate limiting for OTP requests

## Database Schema

The `profiles` table now includes:
- `phone` - User's phone number
- `phone_verified` - Boolean indicating verification status
- `phone_verified_at` - Timestamp of verification
