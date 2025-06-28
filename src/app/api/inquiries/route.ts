import { NextRequest, NextResponse } from 'next/server'
import { 
  handleApiError, 
  validateRequiredFields, 
  formatResponse,
  CrudService,
  getPaginationParamsFromRequest,
  formatPaginatedResponse,
  getSearchQueryFromRequest,
  ApiError,
  getAuthenticatedUser,
  getSupabaseClient,
  parseRequestBody
} from '@/utils/api-app'
import { Inquiry, InquiryCreateRequest } from '@/types/api'

const inquiryService = new CrudService<Inquiry>('inquiries')

// GET /api/inquiries - Fetch inquiries
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    const pagination = getPaginationParamsFromRequest(request)
    const searchQuery = getSearchQueryFromRequest(request)
    const { searchParams: urlParams } = new URL(request.url)
    
    const status = urlParams.get('status')
    const category = urlParams.get('category')
    const priority = urlParams.get('priority')
    const userId = urlParams.get('userId')

    // Build additional filters
    const additionalFilters: any = {}
    if (status) {
      additionalFilters.status = status
    }
    if (category) {
      additionalFilters.category = category
    }
    if (priority) {
      additionalFilters.priority = priority
    }
    
    // Check if user is admin (assuming admin role is stored in user metadata or profile)
    const supabase = await getSupabaseClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    
    // Regular users can only see their own inquiries
    // Admins can see all inquiries or filter by userId
    if (!isAdmin) {
      additionalFilters.user_id = user.id
    } else if (userId) {
      additionalFilters.user_id = userId
    }

    // Custom search logic for inquiries
    if (searchQuery) {
      let customQuery = supabase
        .from('inquiries')
        .select('*', { count: 'exact' })
        .ilike('title', `%${searchQuery}%`)
        .range(
          (pagination.page! - 1) * pagination.limit!,
          pagination.page! * pagination.limit! - 1
        )
        .order(pagination.sortBy!, { ascending: pagination.sortOrder === 'asc' })

      // Apply additional filters
      Object.entries(additionalFilters).forEach(([key, value]) => {
        customQuery = customQuery.eq(key, value)
      })

      const { data, error, count } = await customQuery
      if (error) throw error

      return NextResponse.json(
        formatPaginatedResponse(
          data || [],
          {
            page: pagination.page!,
            limit: pagination.limit!,
            total: count || 0,
          },
          'Inquiries fetched successfully'
        )
      )
    }

    // Use default service for non-search queries
    const { data, total } = await inquiryService.getAll(request, '*', additionalFilters)

    return NextResponse.json(
      formatPaginatedResponse(
        data,
        {
          page: pagination.page!,
          limit: pagination.limit!,
          total,
        },
        'Inquiries fetched successfully'
      )
    )
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/inquiries - Submit a new inquiry
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    const body = await parseRequestBody(request)
    
    const validationError = validateRequiredFields(body, ['title', 'message', 'category'])
    if (validationError) {
      throw new ApiError(400, validationError)
    }

    const createData: InquiryCreateRequest = body
    
    const inquiry = await inquiryService.create({
      user_id: user.id,
      title: createData.title,
      status: 'new',
      priority: createData.priority || 'medium',
      category: createData.category,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Also create the initial message
    const supabase = await getSupabaseClient()
    
    await supabase.from('inquiry_messages').insert([{
      inquiry_id: inquiry.id,
      sender_id: user.id,
      sender_type: 'user',
      message: createData.message,
      created_at: new Date().toISOString(),
    }])

    return NextResponse.json(
      formatResponse(inquiry, 'Inquiry submitted successfully'),
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/inquiries - Update inquiry status (admin only)
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    const body = await parseRequestBody(request)
    
    // Check if user is admin
    const supabase = await getSupabaseClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      throw new ApiError(403, 'Admin access required')
    }

    const validationError = validateRequiredFields(body, ['id'])
    if (validationError) {
      throw new ApiError(400, validationError)
    }

    const { id, status, priority } = body

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (status) updateData.status = status
    if (priority) updateData.priority = priority

    const inquiry = await inquiryService.update(id, updateData)

    return NextResponse.json(
      formatResponse(inquiry, 'Inquiry updated successfully')
    )
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/inquiries - Remove an inquiry
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    const body = await parseRequestBody(request)
    
    const validationError = validateRequiredFields(body, ['id'])
    if (validationError) {
      throw new ApiError(400, validationError)
    }

    const { id } = body

    // Check if user owns the inquiry or is admin
    const inquiry = await inquiryService.getById(id)
    
    const supabase = await getSupabaseClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    
    if (inquiry.user_id !== user.id && !isAdmin) {
      throw new ApiError(403, 'You can only delete your own inquiries')
    }

    await inquiryService.delete(id)

    return NextResponse.json(
      formatResponse(undefined, 'Inquiry deleted successfully')
    )
  } catch (error) {
    return handleApiError(error)
  }
}
