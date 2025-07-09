# Session Activity Management System

This document explains how to use the enhanced session management system that automatically refreshes user sessions based on activity.

## Overview

The session management system has been enhanced with the following features:

1. **Automatic Session Refresh**: Sessions are automatically refreshed when users interact with the app
2. **Activity Tracking**: Multiple types of user interactions are tracked
3. **Configurable Settings**: All timing and behavior can be customized
4. **Session Warnings**: Users are warned before their session expires
5. **Inactivity Detection**: The system detects when users have been inactive

## Configuration

All session settings can be configured at the top of `src/contexts/AuthContext.tsx`:

```typescript
const SESSION_CONFIG = {
  // How often to check for session expiration (in milliseconds)
  CHECK_INTERVAL: 60000, // 1 minute
  
  // Warning time before session expires (in milliseconds)
  WARNING_TIME: 300000, // 5 minutes
  
  // Custom session timeout in minutes (set to null to use Supabase default)
  CUSTOM_SESSION_TIMEOUT_MINUTES: null, // e.g., 60 for 1 hour, 480 for 8 hours
  
  // Activity tracking settings
  ACTIVITY_REFRESH_ENABLED: true, // Enable automatic session refresh on user activity
  ACTIVITY_REFRESH_THRESHOLD: 300000, // 5 minutes - minimum time before allowing another refresh
  INACTIVITY_WARNING_TIME: 600000, // 10 minutes - warn user after this period of inactivity
  
  // Events that count as user activity
  ACTIVITY_EVENTS: [
    'mousedown', 'mousemove', 'keypress', 'scroll', 
    'touchstart', 'click', 'focus'
  ],
  
  // Whether to show console logs for session management
  DEBUG_LOGS: true,
}
```

## Key Features

### 1. Automatic Session Refresh

When `ACTIVITY_REFRESH_ENABLED` is true, the system will:
- Monitor user interactions (mouse, keyboard, touch, scroll)
- Automatically refresh the session when activity is detected
- Respect the `ACTIVITY_REFRESH_THRESHOLD` to prevent too frequent refreshes

### 2. Custom Session Timeout

Set `CUSTOM_SESSION_TIMEOUT_MINUTES` to override Supabase's default session duration:
- `60` = 1 hour session
- `480` = 8 hour session
- `null` = Use Supabase default (typically 1 hour)

### 3. Activity Events

The following events are tracked by default:
- `mousedown`, `mousemove` - Mouse interactions
- `keypress` - Keyboard input
- `scroll` - Page scrolling
- `touchstart` - Touch interactions
- `click` - Clicks
- `focus` - Window/element focus

## Using the Enhanced Context

### New Context Values

```typescript
const {
  // Existing values
  user, loading, session, signOut, refreshUser,
  
  // New session management values
  sessionExpiresAt,           // When the session expires (timestamp)
  isSessionExpired,           // Boolean: is session expired?
  isSessionExpiringSoon,      // Boolean: is session expiring soon?
  minutesUntilExpiry,         // Number: minutes until session expires
  lastActivityTime,           // When user was last active (timestamp)
  refreshSession,             // Function: manually refresh session
  isInactive,                 // Boolean: has user been inactive too long?
} = useAuth()
```

### Activity Tracker Hook

Use the `useActivityTracker` hook in components:

```typescript
import { useActivityTracker } from '@/contexts/AuthContext'

function MyComponent() {
  const { 
    trackActivity,              // Function: manually track activity
    forceRefreshSession,        // Function: force session refresh
    lastActivityTime,           // Last activity timestamp
    isInactive,                 // Is user inactive?
    minutesSinceLastActivity    // Minutes since last activity
  } = useActivityTracker()
  
  const handleImportantAction = () => {
    trackActivity() // Track this as user activity
    // ... your action logic
  }
}
```

## Implementation Examples

### 1. Session Status Component

Use the included `SessionStatus` component:

```typescript
import SessionStatus from '@/components/SessionStatus'

function Dashboard() {
  return (
    <div>
      <SessionStatus 
        showInactivityWarning={true}
        showSessionExpiry={true}
        showRefreshButton={true}
      />
      {/* Your other components */}
    </div>
  )
}
```

### 2. Manual Activity Tracking

Track activity in important user actions:

```typescript
import { useActivityTracker } from '@/contexts/AuthContext'

function FormComponent() {
  const { trackActivity } = useActivityTracker()
  
  const handleSubmit = async (data) => {
    trackActivity() // This ensures session stays active during form submission
    await submitForm(data)
  }
  
  const handleInputChange = () => {
    trackActivity() // Track typing as activity
  }
}
```

### 3. Session Expiry Warnings

Show warnings in your UI:

```typescript
function AppHeader() {
  const { isSessionExpiringSoon, minutesUntilExpiry, refreshSession } = useAuth()
  
  return (
    <header>
      {isSessionExpiringSoon && (
        <Alert severity="warning">
          Session expires in {minutesUntilExpiry} minutes.
          <Button onClick={refreshSession}>Extend Session</Button>
        </Alert>
      )}
    </header>
  )
}
```

## How It Works

### Activity Detection Flow

1. User performs an action (click, type, scroll, etc.)
2. Activity tracker detects the event
3. If enough time has passed since last refresh (`ACTIVITY_REFRESH_THRESHOLD`), trigger session refresh
4. Session expiration time is updated
5. User can continue working without interruption

### Session Expiry Flow

1. System checks session status every `CHECK_INTERVAL`
2. If session expires within `WARNING_TIME`, show warning to user
3. If session has expired, automatically sign out user
4. User activity resets expiry timer (if auto-refresh is enabled)

### Inactivity Detection

1. Track last user activity time
2. If user inactive for longer than `INACTIVITY_WARNING_TIME`, mark as inactive
3. Components can show inactivity warnings
4. Session will still auto-refresh when user returns

## Best Practices

### 1. Configure Timeouts Appropriately

- **Short sessions (30-60 min)**: Good for high-security apps
- **Long sessions (4-8 hours)**: Good for productivity apps
- **Very long sessions (24+ hours)**: Only for low-security contexts

### 2. Use Manual Tracking for Important Actions

```typescript
// Track activity during critical operations
const handlePayment = async () => {
  trackActivity() // Ensure session is fresh for payment
  await processPayment()
}

const handleDataSubmission = async () => {
  trackActivity() // Prevent session expiry during submission
  await submitData()
}
```

### 3. Show User-Friendly Warnings

- Warn users 5-10 minutes before expiry
- Provide easy "extend session" buttons
- Show remaining time clearly

### 4. Handle Session Loss Gracefully

```typescript
const { isSessionExpired } = useAuth()

if (isSessionExpired) {
  return <SessionExpiredMessage />
}
```

## Troubleshooting

### Sessions Not Refreshing

1. Check `ACTIVITY_REFRESH_ENABLED` is `true`
2. Verify `ACTIVITY_REFRESH_THRESHOLD` isn't too high
3. Check browser console for activity tracking logs (when `DEBUG_LOGS` is true)

### Sessions Expiring Too Quickly

1. Increase `CUSTOM_SESSION_TIMEOUT_MINUTES`
2. Decrease `ACTIVITY_REFRESH_THRESHOLD`
3. Add more `ACTIVITY_EVENTS` if needed

### Too Many Refresh Requests

1. Increase `ACTIVITY_REFRESH_THRESHOLD`
2. Remove high-frequency events from `ACTIVITY_EVENTS` (like `mousemove`)

## Security Considerations

- Session refresh extends user access - ensure this aligns with your security requirements
- Consider shorter timeouts for admin users
- Monitor session refresh patterns for unusual activity
- Implement server-side session validation
- Consider requiring re-authentication for sensitive operations even with valid sessions
