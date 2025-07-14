# Resend SMS Feature

This feature adds a resend SMS functionality with a 3-minute timer for the phone verification process.

## Features

### 1. **Timer Display**
- Shows countdown timer for 3 minutes (180 seconds)
- Displays time in MM:SS format
- Updates every second

### 2. **Resend Button**
- Appears after 3-minute timer expires
- Allows users to request a new OTP
- Disabled during sending process

### 3. **User Experience Enhancements**
- Visual timer display with styled background
- Clear messaging about resend availability
- Automatic timer reset on successful resend
- OTP input cleared on resend for better UX

## Implementation Details

### State Management
```typescript
const [resendTimer, setResendTimer] = useState(0)
const [canResend, setCanResend] = useState(false)
```

### Timer Logic
- **Duration**: 180 seconds (3 minutes)
- **Updates**: Every 1 second using `setInterval`
- **Auto-cleanup**: Interval cleared on component unmount
- **Trigger**: Starts when OTP is sent successfully

### Timer Effect
```typescript
React.useEffect(() => {
  let interval: NodeJS.Timeout | null = null
  
  if (otpStep === 'otp_sent' && resendTimer > 0) {
    interval = setInterval(() => {
      setResendTimer((prevTimer) => {
        if (prevTimer <= 1) {
          setCanResend(true)
          return 0
        }
        return prevTimer - 1
      })
    }, 1000)
  }
  
  return () => {
    if (interval) clearInterval(interval)
  }
}, [otpStep, resendTimer])
```

### Resend Functionality
```typescript
const handleResendOtp = async () => {
  // 1. Send new OTP request
  // 2. Reset timer to 3 minutes
  // 3. Clear OTP input field
  // 4. Show success/error message
}
```

## User Interface

### Timer Display
- **Location**: Below OTP input field
- **Style**: Light gray background with rounded corners
- **Content**: Shows countdown or "didn't receive SMS?" message

### Resend Button
- **Visibility**: Only shown when timer expires (canResend = true)
- **Style**: Text button with primary color
- **States**: Normal, Loading ("재발송 중...")

### Visual States
1. **During Timer**: Shows countdown with secondary text color
2. **Timer Expired**: Shows availability message with primary color
3. **Resending**: Button shows loading state

## User Flow

1. **User sends OTP**: Timer starts at 3:00
2. **Timer counts down**: Updates every second (2:59, 2:58, ...)
3. **Timer expires**: Shows "인증번호를 받지 못하셨나요?" message
4. **Resend button appears**: User can click to resend
5. **User clicks resend**: New OTP sent, timer resets to 3:00
6. **Process repeats**: User can resend multiple times if needed

## Smart Reset Behavior

### Phone Number Change
If user changes phone number after sending OTP:
- Resets OTP step to 'initial'
- Clears OTP input field
- Resets timer to 0
- Hides resend button

### Successful Verification
When OTP is verified successfully:
- Timer automatically stops
- Component transitions to 'verified' state

## Benefits

1. **Improved UX**: Users know exactly when they can resend
2. **Reduced Support**: Clear indication of resend availability
3. **Prevents Spam**: 3-minute cooldown prevents excessive requests
4. **Visual Feedback**: Clear timer and status indicators
5. **Smart Behavior**: Automatically resets on phone number change

## Configuration

### Timer Duration
```typescript
const startResendTimer = () => {
  setResendTimer(180) // 3 minutes = 180 seconds
  setCanResend(false)
}
```

### Timer Format
```typescript
const formatTimer = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
```

## Testing

To test the resend feature:

1. Enter phone number and send OTP
2. Wait for timer to start counting down
3. Observe timer updates every second
4. Wait 3 minutes for resend button to appear
5. Click resend button to send new OTP
6. Verify timer resets to 3:00

For quick testing, you can temporarily reduce the timer duration from 180 to 10 seconds in the `startResendTimer` function.
