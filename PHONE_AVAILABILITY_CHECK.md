# Phone Number Availability Check Feature

This feature adds phone number availability checking to prevent duplicate phone numbers during signup.

## Features Added

### 1. Phone Availability Check Function
- **Location**: `src/app/api/auth/phone/actions.ts`
- **Function**: `checkPhoneAvailability(phoneNumber: string)`
- **Purpose**: Checks if a phone number is already registered in the system

### 2. Enhanced OTP Flow
- **Pre-OTP Validation**: Phone availability is checked before sending OTP
- **Real-time Feedback**: Users get immediate feedback on phone availability
- **Error Prevention**: Prevents OTP sending to already registered numbers

### 3. UI Improvements
- **Visual Indicators**: Button color changes based on availability status
- **Helper Text**: Shows availability messages below the input field
- **Error State**: Input field shows error state for unavailable numbers
- **Smart Button**: Button text changes based on availability status

## Implementation Details

### Phone Availability Check
```typescript
export async function checkPhoneAvailability(phoneNumber: string): Promise<PhoneAvailabilityState> {
  // 1. Validate phone number format
  // 2. Query profiles table for existing phone number
  // 3. Return availability status with appropriate message
}
```

### Integration with OTP Flow
```typescript
export async function sendPhoneOtp(phoneNumber: string): Promise<PhoneOtpState> {
  // 1. Check phone availability first
  // 2. If available, proceed with OTP sending
  // 3. If not available, return error without sending OTP
}
```

### UI Components
- **Phone Input Field**: 
  - Real-time availability checking on blur
  - Error state for unavailable numbers
  - Helper text for status messages
  
- **Send OTP Button**:
  - Disabled when phone is unavailable
  - Color changes based on availability
  - Text changes based on status

## User Experience Flow

1. **User enters phone number**
2. **On blur**: System checks availability
3. **If available**: 
   - Green helper text: "사용 가능한 휴대폰 번호입니다."
   - Button becomes active and changes color
4. **If not available**:
   - Red error state with message: "이미 사용 중인 휴대폰 번호입니다."
   - Button remains disabled
5. **OTP sending**: Only works for available numbers

## Debug Mode

For development and testing:
- Set `NEXT_PUBLIC_ENABLE_REAL_SMS=false` (or don't set it)
- Use `123456` as the OTP code
- Phone availability check still works normally

## Error Handling

- **Invalid format**: Shows format error message
- **Database errors**: Shows generic error message
- **Already registered**: Shows specific "already in use" message
- **Network errors**: Shows connection error message

## Benefits

1. **Prevents Duplicate Registrations**: Stops users from registering with already used phone numbers
2. **Better User Experience**: Immediate feedback on phone availability
3. **Reduces Support Issues**: Prevents confusion about duplicate accounts
4. **Cost Savings**: Prevents unnecessary OTP sending to registered numbers
5. **Data Integrity**: Ensures unique phone numbers in the system

## Testing

To test the phone availability check:

1. Navigate to signup page
2. Enter an existing phone number
3. Click outside the input (blur event)
4. Should see error message and disabled button
5. Enter a new phone number
6. Should see success message and enabled button
7. Click "인증번호 발송" to proceed with OTP
