import { NextRequest, NextResponse } from 'next/server'
import { 
  handleApiError, 
  validateRequiredFields, 
  formatResponse,
  formatPaginatedResponse,
  ApiError,
  getSupabaseClient,
  getPaginationParamsFromRequest,
  getSearchQueryFromRequest
} from '@/utils/api-app'
import { User, UserUpdateRequest } from '@/types/api'

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = await getSupabaseClient(true)
    const pagination = getPaginationParamsFromRequest(request)
    const searchQuery = getSearchQueryFromRequest(request)

    // List users from auth schema
    const {
      data: { users },
      error: listError,
    } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) throw listError

    // Apply search filter if provided
    let filteredUsers = users
    if (searchQuery) {
      filteredUsers = users.filter(user => 
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply pagination
    const startIndex = (pagination.page! - 1) * pagination.limit!
    const endIndex = startIndex + pagination.limit!
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    // Fetch corresponding profiles
    const userIds = paginatedUsers.map(user => user.id)
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('id', userIds)

    if (profileError) throw profileError

    // Combine auth user data with profile data
    const combinedUsers: User[] = paginatedUsers.map(user => {
      const profile = profiles?.find(p => p.id === user.id)
      return {
        id: user.id,
        name: profile?.full_name || 'N/A',
        email: user.email || '',
        phone: profile?.phone_number || 'N/A',
        signupDate: new Date(user.created_at).toLocaleDateString(),
        status: user.email_confirmed_at ? 'Active' : 'Pending',
        points: profile?.points || 0,
      }
    })

    return NextResponse.json(
      formatPaginatedResponse(
        combinedUsers,
        {
          page: pagination.page!,
          limit: pagination.limit!,
          total: filteredUsers.length,
        },
        'Users fetched successfully'
      )
    )

  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validationError = validateRequiredFields(body, ['userId'])
    if (validationError) {
      throw new ApiError(400, validationError)
    }

    const { userId, status, points }: UserUpdateRequest = body
    const supabaseAdmin = await getSupabaseClient(true)

    // Update points in the profiles table
    if (points !== undefined) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ points })
        .eq('id', userId)
      
      if (profileError) throw profileError
    }

    // Update status in the auth.users table
    if (status === 'Suspended') {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { ban_duration: 'none' }
      )
      if (authError) throw authError
    } else if (status === 'Active') {
      // Remove ban if setting to active
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { ban_duration: undefined }
      )
      if (authError) throw authError
    }

    return NextResponse.json(
      formatResponse(
        { userId, status, points },
        'User updated successfully'
      )
    )

  } catch (error) {
    return handleApiError(error)
  }
}
