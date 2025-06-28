'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { User } from '@/types/api'

// Fetch users with optional filters and search
export async function fetchUsers(options?: {
  search?: string
  status?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  const supabase = await createAdminClient()

  try {
    const {
      search,
      status,
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options || {}

    // First get auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
      page,
      perPage: limit
    })

    if (authError) throw authError

    // Get user IDs
    const userIds = authUsers.users.map(user => user.id)

    // Fetch profiles for these users
    let profileQuery = supabase
      .from('profiles')
      .select('*')
      .in('id', userIds)

    // Apply search filter
    if (search) {
      profileQuery = profileQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data: profiles, error: profileError } = await profileQuery

    if (profileError) throw profileError

    // Combine auth user data with profile data
    const combinedUsers = authUsers.users.map(user => {
      const profile = profiles?.find(p => p.id === user.id)
      return {
        id: user.id,
        name: profile?.full_name || user.user_metadata?.full_name || 'N/A',
        email: user.email || '',
        phone: profile?.phone_number || 'N/A',
        signupDate: new Date(user.created_at).toLocaleDateString(),
        status: user.email_confirmed_at ? 'Active' : 'Pending',
        points: profile?.points || 0,
      } as User
    })

    return {
      data: combinedUsers,
      total: authUsers.users.length,
      page,
      limit,
      totalPages: Math.ceil(authUsers.users.length / limit)
    }
  } catch (error: any) {
    console.error('Error fetching users:', error.message)
    throw new Error('Failed to fetch users.')
  }
}

// Suspend a user
export async function suspendUser(userId: string) {
  const supabase = await createClient()

  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Update user status in auth
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      ban_duration: 'none' // Permanent ban
    })

    if (error) throw error

    // Update profile status
    await supabase
      .from('profiles')
      .update({ status: 'Suspended' })
      .eq('id', userId)

    return { success: true, message: 'User suspended successfully' }
  } catch (error: any) {
    console.error('Error suspending user:', error.message)
    throw new Error(error.message || 'Failed to suspend user.')
  }
}

// Update user points
export async function updateUserPoints(userId: string, points: number) {
  const supabase = await createClient()

  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ points })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error: any) {
    console.error('Error updating user points:', error.message)
    throw new Error(error.message || 'Failed to update user points.')
  }
}

// Get user details by ID
export async function getUserById(userId: string) {
  const supabase = await createClient()

  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Get auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
    if (authError) throw authError

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) throw profileError

    return {
      id: authUser.user.id,
      name: profile?.full_name || authUser.user.user_metadata?.full_name || 'N/A',
      email: authUser.user.email || '',
      phone: profile?.phone_number || 'N/A',
      signupDate: new Date(authUser.user.created_at).toLocaleDateString(),
      status: authUser.user.email_confirmed_at ? 'Active' : 'Pending',
      points: profile?.points || 0,
    } as User
  } catch (error: any) {
    console.error('Error fetching user:', error.message)
    throw new Error('Failed to fetch user.')
  }
}
