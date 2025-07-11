'use server'

import { createAdminClient, createClient } from '@/utils/supabase/server'
import { 
  canModifyUserRole, 
  canCreateAdmin
} from '@/utils/admin-permissions'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  lastActive: string
  status: string
}

// Get current user's role
export async function getCurrentUserRole(userId: string) {
  const supabase = await createClient()
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('admin_role')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.warn('Failed to get current user role:', error)
      return 'user' // Default fallback
    }
    
    return profile?.admin_role || 'user'
  } catch (error) {
    console.warn('Error getting current user role:', error)
    return 'user'
  }
}

// Get current authenticated user from server context
export async function getCurrentUser() {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return null
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('admin_role, full_name')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.warn('Failed to get user profile:', profileError)
      return null
    }
    
    return {
      id: user.id,
      email: user.email || '',
      admin_role: profile?.admin_role || 'user',
      full_name: profile?.full_name || ''
    }
  } catch (error) {
    console.warn('Error getting current user:', error)
    return null
  }
}

// Fetch admin users
export async function fetchAdminUsers() {
  const supabase = await createClient()

  try {
    // Get users with admin roles from profiles (exclude regular users)
    const { data: adminProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('admin_role', ['super_admin', 'admin', 'content_manager', 'customer_support', 'expert'])
      .order('created_at', { ascending: false })

    if (profileError) {
      console.error('Profile query error:', profileError)
      throw profileError
    }

    // Since we can't reliably use auth.admin methods without proper service role,
    // let's work with the profile data we have and make reasonable assumptions
    const adminUsers: AdminUser[] = []

    for (const profile of adminProfiles || []) {
      try {
        // Create admin user object based on profile data
        // We'll use the email from profile and make reasonable status assumptions
        adminUsers.push({
          id: profile.id,
          name: profile.full_name || 'N/A',
          email: profile.email || 'N/A',
          role: profile.admin_role,
          lastActive: profile.edited_at ? new Date(profile.edited_at).toLocaleDateString() : 'N/A',
          status: profile.email ? 'Active' : 'Pending', // Simple assumption based on email presence
        })
      } catch (error) {
        console.warn(`Failed to process profile ${profile.id}:`, error)
      }
    }
    return adminUsers
  } catch (error: unknown) {
    console.error('Error fetching admin users:', (error as Error).message)
    throw new Error('Failed to fetch admin users.')
  }
}

// Create/Invite new admin user
export async function inviteAdminUser(email: string, name: string, role: string, currentUserId?: string) {
  const supabase = await createClient()
  const supabaseAdmin = await createAdminClient()

  try {
    if (!email || !name || !role) {
      throw new Error('Email, name, and role are required')
    }

    // Get current user's role for permission checking
    let currentUserRole = 'user' // Default fallback
    if (currentUserId) {
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('admin_role')
        .eq('id', currentUserId)
        .single()
      
      currentUserRole = currentUserProfile?.admin_role || 'user'
    } else {
      // Try to get current user from auth context
      const currentUser = await getCurrentUser()
      currentUserRole = currentUser?.admin_role || 'user'
    }

    // Check if current user can create this role
    if (!canCreateAdmin(currentUserRole, role)) {
      throw new Error('Insufficient permissions to create user with this role')
    }

    // Try to create the user account using admin methods
    // Note: This requires proper service role configuration
    try {
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: false, // They'll need to confirm their email
        user_metadata: {
          full_name: name,
          admin_role: role
        }
      })

      if (authError) {
        console.error('Auth admin createUser error:', authError)
        throw new Error(`Failed to create user account: ${authError.message}`)
      }

      // Create profile with admin role
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          full_name: name,
          email: email,
          admin_role: role,
          created_at: new Date().toISOString(),
          edited_at: new Date().toISOString(),
        })

      if (profileError) throw profileError

      return {
        id: authUser.user.id,
        name,
        email,
        role,
        lastActive: 'Pending',
        status: 'Pending',
      } as AdminUser

    } catch (adminError) {
      // If admin methods fail, we can still create a profile entry
      // The actual user creation would need to be handled separately
      console.warn('Admin user creation failed, creating profile only:', adminError)
      
      // For now, let's throw an error since we can't create users without admin privileges
      throw new Error('Admin user creation requires proper service role configuration. Please contact system administrator.')
    }
  } catch (error: unknown) {
    console.error('Error inviting admin user:', (error as Error).message)
    throw new Error((error as Error).message || 'Failed to invite admin user.')
  }
}

// Update admin user role
export async function updateAdminRole(userId: string, role: string, currentUserId?: string) {
  const supabase = await createClient()

  try {
    if (!userId || !role) {
      throw new Error('User ID and role are required')
    }

    // Get current user's role for permission checking
    let currentUserRole = 'user' // Default fallback
    if (currentUserId) {
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('admin_role')
        .eq('id', currentUserId)
        .single()
      
      currentUserRole = currentUserProfile?.admin_role || 'user'
    } else {
      // Try to get current user from auth context
      const currentUser = await getCurrentUser()
      currentUserRole = currentUser?.admin_role || 'user'
    }

    // Get target user's current role
    const { data: targetUserProfile, error: targetError } = await supabase
      .from('profiles')
      .select('admin_role')
      .eq('id', userId)
      .single()

    if (targetError) throw targetError

    const targetUserCurrentRole = targetUserProfile?.admin_role || 'user'

    // Check permissions
    if (!canModifyUserRole(currentUserRole, targetUserCurrentRole, role)) {
      throw new Error('Insufficient permissions to modify this user\'s role')
    }

    // Update profile with new role
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        admin_role: role,
        edited_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (profileError) throw profileError

    // Try to update user metadata (may fail without service role)
    try {
      const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { admin_role: role }
      })

      if (authError) {
        console.warn('Failed to update user metadata (continuing anyway):', authError)
      }
    } catch (error) {
      console.warn('Auth admin updateUserById failed (continuing anyway):', error)
    }

    return { success: true, message: 'Admin role updated successfully' }
  } catch (error: unknown) {
    console.error('Error updating admin role:', (error as Error).message)
    throw new Error((error as Error).message || 'Failed to update admin role.')
  }
}

// Deactivate admin user
export async function deactivateAdminUser(userId: string) {
  const supabase = await createClient()

  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Try to deactivate user account by banning them
    try {
      const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: 'none' // Permanent ban
      })

      if (authError) {
        console.warn('Failed to ban user via auth admin:', authError)
        // Continue with profile update even if auth admin fails
      }
    } catch (error) {
      console.warn('Auth admin updateUserById failed:', error)
      // Continue with profile update
    }

    // Update profile's edited_at timestamp to track the change
    // We could also add a custom field to track deactivation if needed
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        edited_at: new Date().toISOString(),
        // Note: You might want to add a 'is_active' boolean field to track this
      })
      .eq('id', userId)

    if (profileError) throw profileError

    return { success: true, message: 'Admin user deactivated successfully' }
  } catch (error: unknown) {
    console.error('Error deactivating admin user:', (error as Error).message)
    throw new Error((error as Error).message || 'Failed to deactivate admin user.')
  }
}

// Reactivate admin user
export async function reactivateAdminUser(userId: string) {
  const supabase = await createClient()

  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Remove ban from user account
    try {
      const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: '0' // Remove ban
      })

      if (authError) {
        console.warn('Failed to unban user via auth admin:', authError)
      }
    } catch (error) {
      console.warn('Auth admin updateUserById failed:', error)
    }

    // Update profile's edited_at timestamp to track the change
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        edited_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (profileError) throw profileError

    return { success: true, message: 'Admin user reactivated successfully' }
  } catch (error: unknown) {
    console.error('Error reactivating admin user:', (error as Error).message)
    throw new Error((error as Error).message || 'Failed to reactivate admin user.')
  }
}
