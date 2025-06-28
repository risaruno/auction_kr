'use client'

import React from 'react'
import { useAuth, useIsAdmin, useIsSuperAdmin } from '@/contexts/AuthContext'
import { Box, CircularProgress, Typography, Alert } from '@mui/material'
import { type AdminRole } from '@/utils/auth/roles'

interface RequireAuthProps {
  children: React.ReactNode
  requiredRole?: AdminRole | AdminRole[]
  fallback?: React.ReactNode
}

export function RequireAuth({ children, requiredRole, fallback }: RequireAuthProps) {
  const { user, loading } = useAuth()
  const isAdmin = useIsAdmin()
  const isSuperAdmin = useIsSuperAdmin()

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress />
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  if (!user) {
    return (
      fallback || (
        <Alert severity="error">
          You must be logged in to access this page.
        </Alert>
      )
    )
  }

  if (requiredRole) {
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    const hasRequiredRole = requiredRoles.includes(user.admin_role)

    if (!hasRequiredRole) {
      return (
        fallback || (
          <Alert severity="error">
            You don't have permission to access this page. Required role: {requiredRoles.join(' or ')}
          </Alert>
        )
      )
    }
  }

  return <>{children}</>
}

// Specific role-based components
export function RequireAdmin({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RequireAuth 
      requiredRole={['super_admin', 'content_manager', 'customer_support']} 
      fallback={fallback}
    >
      {children}
    </RequireAuth>
  )
}

export function RequireSuperAdmin({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RequireAuth 
      requiredRole="super_admin" 
      fallback={fallback}
    >
      {children}
    </RequireAuth>
  )
}

export function RequireContentManager({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RequireAuth 
      requiredRole={['super_admin', 'content_manager']} 
      fallback={fallback}
    >
      {children}
    </RequireAuth>
  )
}

// Hook for conditional rendering based on permissions
export function usePermissions() {
  const { user } = useAuth()
  const isAdmin = useIsAdmin()
  const isSuperAdmin = useIsSuperAdmin()

  return {
    canAccessAdmin: isAdmin,
    canManageUsers: isSuperAdmin,
    canManageContent: user?.admin_role === 'super_admin' || user?.admin_role === 'content_manager',
    canHandleSupport: isAdmin,
    canManageExperts: isAdmin,
    canManageFAQs: user?.admin_role === 'super_admin' || user?.admin_role === 'content_manager',
    canViewBiddings: isAdmin,
  }
}
