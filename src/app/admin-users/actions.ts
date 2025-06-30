'use server'

import { createClient } from '@/utils/supabase/server'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  lastActive: string
  status: string
}

// Fetch admin users
export async function fetchAdminUsers() {
  const supabase = await createClient()

  try {
    // Get users with admin roles from profiles
    const { data: adminProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .not('admin_role', 'is', null)
      .order('created_at', { ascending: false })

    if (profileError) throw profileError

    // Get corresponding auth users
    const adminUsers: AdminUser[] = []

    for (const profile of adminProfiles || []) {
      try {
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profile.id)
        
        if (!authError && authUser.user) {
          adminUsers.push({
            id: authUser.user.id,
            name: profile.full_name || authUser.user.user_metadata?.full_name || 'N/A',
            email: authUser.user.email || '',
            role: profile.admin_role || 'Customer Support',
            lastActive: profile.last_sign_in_at ? new Date(profile.last_sign_in_at).toLocaleDateString() : 'Never',
            status: authUser.user.email_confirmed_at ? 'Active' : 'Pending',
          })
        }
      } catch (error) {
        console.warn(`Failed to fetch user ${profile.id}:`, error)
      }
    }

    return adminUsers
  } catch (error: any) {
    console.error('Error fetching admin users:', error.message)
    throw new Error('Failed to fetch admin users.')
  }
}

// Create/Invite new admin user
export async function inviteAdminUser(email: string, name: string, role: string) {
  const supabase = await createClient()

  try {
    if (!email || !name || !role) {
      throw new Error('Email, name, and role are required')
    }

    // Create the user account
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: false, // They'll need to confirm their email
      user_metadata: {
        full_name: name,
        admin_role: role
      }
    })

    if (authError) throw authError

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
  } catch (error: any) {
    console.error('Error inviting admin user:', error.message)
    throw new Error(error.message || 'Failed to invite admin user.')
  }
}

// Update admin user role
export async function updateAdminRole(userId: string, role: string) {
  const supabase = await createClient()

  try {
    if (!userId || !role) {
      throw new Error('User ID and role are required')
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

    // Update user metadata
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { admin_role: role }
    })

    if (authError) throw authError

    return { success: true, message: 'Admin role updated successfully' }
  } catch (error: any) {
    console.error('Error updating admin role:', error.message)
    throw new Error(error.message || 'Failed to update admin role.')
  }
}

// Deactivate admin user
export async function deactivateAdminUser(userId: string) {
  const supabase = await createClient()

  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Deactivate user account
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      ban_duration: 'none' // Permanent ban
    })

    if (authError) throw authError

    // Update profile status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        status: 'Deactivated',
        edited_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (profileError) throw profileError

    return { success: true, message: 'Admin user deactivated successfully' }
  } catch (error: any) {
    console.error('Error deactivating admin user:', error.message)
    throw new Error(error.message || 'Failed to deactivate admin user.')
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
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      ban_duration: '0' // Remove ban
    })

    if (authError) throw authError

    // Update profile status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        status: 'Active',
        edited_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (profileError) throw profileError

    return { success: true, message: 'Admin user reactivated successfully' }
  } catch (error: any) {
    console.error('Error reactivating admin user:', error.message)
    throw new Error(error.message || 'Failed to reactivate admin user.')
  }
}
