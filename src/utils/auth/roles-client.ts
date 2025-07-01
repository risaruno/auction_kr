// Client-side role utilities (no server imports)
export type AdminRole = 'super_admin' | 'content_manager' | 'customer_support' | 'expert' | 'user'

export interface UserWithRole {
  id: string
  email: string
  admin_role: AdminRole
  full_name: string
}

// Check if user has any admin role
export function isAdmin(role: AdminRole | null | undefined): boolean {
  const adminRoles: AdminRole[] = ['super_admin', 'content_manager', 'customer_support']
  return role ? adminRoles.includes(role) : false
}

// Check if user is super admin
export function isSuperAdmin(role: AdminRole | null | undefined): boolean {
  return role === 'super_admin'
}

// Check if user can manage content (FAQs, experts, etc.)
export function canManageContent(role: AdminRole | null | undefined): boolean {
  const contentRoles: AdminRole[] = ['super_admin', 'content_manager']
  return role ? contentRoles.includes(role) : false
}

// Check if user can manage users
export function canManageUsers(role: AdminRole | null | undefined): boolean {
  const userManagementRoles: AdminRole[] = ['super_admin']
  return role ? userManagementRoles.includes(role) : false
}

// Check if user can handle customer support
export function canHandleSupport(role: AdminRole | null | undefined): boolean {
  const supportRoles: AdminRole[] = ['super_admin', 'content_manager', 'customer_support']
  return role ? supportRoles.includes(role) : false
}

// Role-based redirect helper
export function getRedirectPath(role: AdminRole | null | undefined): string {
  if (isAdmin(role)) {
    return '/auth/manage'
  }
  return '/auth/user'
}
