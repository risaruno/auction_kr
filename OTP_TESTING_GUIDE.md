# OTP Testing Guide

## Overview
The OTP functionality has been refactored to handle Supabase/Twilio configuration issues. The implementation now includes:

1. **Better phone number validation** - Only accepts Korean mobile numbers (010-XXXX-XXXX format)
2. **Development mock mode** - For testing without SMS service
3. **Real SMS mode** - For testing with properly configured Supabase + Twilio
4. **Production fallback** - Graceful error handling when SMS is not configured

## Testing Modes

### 1. Mock SMS Mode (Default)
**Configuration**: `NEXT_PUBLIC_ENABLE_REAL_SMS=false` or not set

In this mode:
- No real SMS is sent
- Mock OTP is generated and logged to console
- OTP is stored in localStorage for verification
- Perfect for development and testing UI flow

**Testing Steps**:
1. Enter phone number: `01012345678`
2. Click "인증번호 받기"
3. Check browser console for: "Mock OTP generated: 123456"
4. Enter the 6-digit code
5. Click "인증 확인"

### 2. Real SMS Mode
**Configuration**: `NEXT_PUBLIC_ENABLE_REAL_SMS=true`

**Prerequisites**:
1. **Twilio Account Setup**:
   - Create account at [Twilio](https://www.twilio.com/)
   - Get Account SID and Auth Token
   - Buy/verify a phone number for sending SMS

2. **Supabase SMS Configuration**:
   - Go to Supabase Dashboard → Authentication → Settings
   - Enable Phone provider
   - Add Twilio credentials:
     - Account SID
     - Auth Token
     - From Phone Number (must be verified in Twilio)

**Testing Steps**:
1. Set environment variable: `NEXT_PUBLIC_ENABLE_REAL_SMS=true`
2. Restart your development server
3. Enter your real phone number: `01012345678`
4. Click "인증번호 받기"
5. Check your phone for SMS with 6-digit code
6. Enter the received code
7. Click "인증 확인"

## Environment Configuration

Create a `.env.local` file in your project root:

```bash
# For Mock SMS (default)
NEXT_PUBLIC_ENABLE_REAL_SMS=false

# For Real SMS
NEXT_PUBLIC_ENABLE_REAL_SMS=true

# Your Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Troubleshooting Real SMS

### Common Errors:

1. **"Invalid From Number"**:
   - Verify your Twilio phone number is active
   - Ensure the number is properly formatted in Supabase settings
   - Check that the number has SMS capabilities

2. **"Account not configured"**:
   - Verify Twilio credentials in Supabase dashboard
   - Ensure Phone provider is enabled in Supabase Auth settings

3. **SMS not received**:
   - Check Twilio logs in your Twilio console
   - Verify the recipient phone number is correct
   - Check if the number is on Twilio's blacklist

### Testing with Twilio Trial Account:

If using a Twilio trial account:
- You can only send SMS to verified phone numbers
- Add your phone number to verified numbers in Twilio console
- Messages will include "[TRIAL]" prefix

## Phone Number Format
- **Input**: `01012345678` (11 digits, starting with 010)
- **Formatted**: `+821012345678` (E.164 format for Supabase)
- **Validation**: Automatically removes non-digits and limits to 11 characters

## Cost Considerations
- Twilio charges per SMS sent (usually $0.075 per message)
- Use mock mode for development to avoid charges
- Only enable real SMS for actual testing/production

## Files Modified
- `src/utils/auth/otp.ts` - OTP logic with mock/real SMS modes
- `src/app/apply-bid/components/InputForm.tsx` - Phone validation and UI
- `.env.example` - Environment configuration example
