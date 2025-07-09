import React from 'react'
import { Box, Typography, Chip, Button, Alert } from '@mui/material'
import { useAuth, useActivityTracker } from '@/contexts/AuthContext'

interface SessionStatusProps {
  showInactivityWarning?: boolean
  showSessionExpiry?: boolean
  showRefreshButton?: boolean
}

export default function SessionStatus({ 
  showInactivityWarning = true,
  showSessionExpiry = true,
  showRefreshButton = true
}: SessionStatusProps) {
  const { 
    user, 
    isSessionExpired, 
    isSessionExpiringSoon, 
    minutesUntilExpiry, 
    sessionExpiresAt 
  } = useAuth()
  
  const { 
    isInactive, 
    minutesSinceLastActivity, 
    forceRefreshSession 
  } = useActivityTracker()

  if (!user) {
    return null
  }

  return (
    <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Session Status
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        <Chip 
          label={`User: ${user.full_name || user.email}`} 
          color="primary" 
          size="small" 
        />
        
        {sessionExpiresAt && (
          <Chip 
            label={`Expires: ${new Date(sessionExpiresAt).toLocaleTimeString()}`} 
            color="info" 
            size="small" 
          />
        )}
        
        {minutesUntilExpiry !== null && (
          <Chip 
            label={`${minutesUntilExpiry} min left`} 
            color={isSessionExpiringSoon ? "warning" : "success"} 
            size="small" 
          />
        )}
        
        {minutesSinceLastActivity !== null && (
          <Chip 
            label={`Last activity: ${minutesSinceLastActivity} min ago`} 
            color={isInactive ? "error" : "default"} 
            size="small" 
          />
        )}
      </Box>

      {/* Session Expiry Warning */}
      {showSessionExpiry && isSessionExpiringSoon && !isSessionExpired && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Your session will expire in {minutesUntilExpiry} minutes. 
          {showRefreshButton && (
            <Button 
              size="small" 
              onClick={forceRefreshSession}
              sx={{ ml: 1 }}
            >
              Refresh Session
            </Button>
          )}
        </Alert>
      )}

      {/* Session Expired */}
      {isSessionExpired && (
        <Alert severity="error" sx={{ mb: 1 }}>
          Your session has expired. Please sign in again.
        </Alert>
      )}

      {/* Inactivity Warning */}
      {showInactivityWarning && isInactive && !isSessionExpired && (
        <Alert severity="info" sx={{ mb: 1 }}>
          You've been inactive for a while. Your session will be automatically refreshed when you interact with the app.
        </Alert>
      )}

      {/* Manual Refresh Button */}
      {showRefreshButton && !isSessionExpired && (
        <Button 
          variant="outlined" 
          size="small" 
          onClick={forceRefreshSession}
          sx={{ mt: 1 }}
        >
          Refresh Session Now
        </Button>
      )}
    </Box>
  )
}
