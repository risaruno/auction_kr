// Admin role permission utilities
// These are client-side utility functions that don't need to be server actions

// Role hierarchy definitions
export const ROLE_HIERARCHY = {
  super_admin: 5,
  admin: 4,
  content_manager: 3,
  customer_support: 2,
  expert: 1,
  user: 0
} as const

// Check if current user can modify target user's role
export function canModifyUserRole(currentUserRole: string, targetUserRole: string, newRole: string): boolean {
  // Super admin can do anything
  if (currentUserRole === 'super_admin') {
    // But super_admin role cannot be changed to anything else
    if (targetUserRole === 'super_admin' && newRole !== 'super_admin') {
      return false
    }
    return true
  }

  // Admin users cannot modify super_admin or other admin users
  if (currentUserRole === 'admin') {
    if (targetUserRole === 'super_admin' || targetUserRole === 'admin') {
      return false
    }
    // Admin can only assign roles below admin level
    if (newRole === 'super_admin' || newRole === 'admin') {
      return false
    }
    return true
  }

  // Other roles cannot modify admin-level users
  return false
}

// Get allowed roles for current user
export function getAllowedRoles(currentUserRole: string): string[] {
  if (currentUserRole === 'super_admin') {
    return ['super_admin', 'admin', 'content_manager', 'customer_support', 'expert', 'user']
  }
  
  if (currentUserRole === 'admin') {
    return ['content_manager', 'customer_support', 'expert', 'user']
  }
  
  return [] // Other roles cannot assign roles
}

// Check if user can create new admin accounts
export function canCreateAdmin(currentUserRole: string, newRole: string): boolean {
  if (currentUserRole === 'super_admin') {
    return true // Super admin can create any role
  }
  
  if (currentUserRole === 'admin') {
    // Admin cannot create super_admin or admin roles
    return newRole !== 'super_admin' && newRole !== 'admin'
  }
  
  return false
}

// Check if a user role is protected (cannot be modified)
export function isProtectedRole(role: string, targetRole: string): boolean {
  // Super admin role cannot be changed to anything else
  if (targetRole === 'super_admin' && role !== 'super_admin') {
    return true
  }
  return false
}

// Check if user can manage other users (has admin privileges)
export function canManageUsers(userRole: string): boolean {
  return userRole === 'super_admin' || userRole === 'admin'
}

// Check if user can deactivate/reactivate users
export function canDeactivateUser(currentUserRole: string, targetUserRole: string): boolean {
  // Super admin can deactivate anyone except other super admins
  if (currentUserRole === 'super_admin') {
    return targetUserRole !== 'super_admin'
  }
  
  // Admin can deactivate users below admin level
  if (currentUserRole === 'admin') {
    return targetUserRole !== 'super_admin' && targetUserRole !== 'admin'
  }
  
  return false
}
