'use client'

import React from 'react'
import { useAuth, useIsAdmin, useIsSuperAdmin } from '@/contexts/AuthContext'
import { Box, CircularProgress, Typography, Alert } from '@mui/material'
import { type AdminRole } from '@/utils/auth/roles-client'

interface RequireAuthProps {
  children: React.ReactNode
  requiredRole?: AdminRole | AdminRole[]
  fallback?: React.ReactNode
}

export function RequireAuth({ children, requiredRole, fallback }: RequireAuthProps) {
  const { user, loading, isInitialized } = useAuth()

  // Debug info for development
  React.useEffect(() => {
    console.log('RequireAuth state:', { loading, isInitialized, hasUser: !!user, userEmail: user?.email })
  }, [loading, isInitialized, user])

  // Only show loading if we're not initialized yet
  if (loading && !isInitialized) {
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
        <Typography>인증 상태를 확인하는 중...</Typography>
        <Typography variant="caption" color="text.secondary">
          로딩이 계속될 경우 페이지를 새로고침 해주세요
        </Typography>
      </Box>
    )
  }

  if (!user) {
    // Redirect to login page instead of showing error
    if (typeof window !== 'undefined') {
      window.location.href = '/sign/in'
      return null
    }
    
    return (
      fallback || (
        <Alert severity="error">
          로그인이 필요합니다. 잠시 후 로그인 페이지로 이동합니다.
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
            You don&apos;t have permission to access this page. Required role: {requiredRoles.join(' or ')}
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
