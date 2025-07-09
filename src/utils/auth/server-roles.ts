import { createClient } from '@/utils/supabase/server'
import { type AdminRole, type UserWithRole, isAdmin, isSuperAdmin } from './roles'

// Get current user with role from server-side
export async function getCurrentUserWithRole(): Promise<UserWithRole | null> {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('admin_role, full_name')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return null
    }

    return {
      id: user.id,
      email: user.email || '',
      admin_role: profile?.admin_role || 'user',
      full_name: profile?.full_name || ''
    }
  } catch (error) {
    console.error('Error getting current user with role:', error)
    return null
  }
}

// Update user role (only for super admins)
export async function updateUserRole(userId: string, newRole: AdminRole): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  try {
    // First check if current user is super admin
    const currentUser = await getCurrentUserWithRole()
    if (!currentUser || !isSuperAdmin(currentUser.admin_role)) {
      return { success: false, error: 'Unauthorized: Only super admins can update user roles' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ admin_role: newRole })
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Role-based redirect helper
export function getRedirectPath(role: AdminRole | null | undefined): string {
  if (isAdmin(role)) {
    return '/auth/manage'
  }
  return '/auth/user'
}
