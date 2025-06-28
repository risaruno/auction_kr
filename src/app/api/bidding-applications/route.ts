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
import { BiddingApplication, BiddingApplicationCreateRequest, BiddingApplicationUpdateRequest } from '@/types/api'

const biddingApplicationService = new CrudService<BiddingApplication>('bidding_applications')

// GET /api/bidding-applications - Fetch bidding applications
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    const pagination = getPaginationParamsFromRequest(request)
    const searchQuery = getSearchQueryFromRequest(request)
    const { searchParams: urlParams } = new URL(request.url)
    
    const status = urlParams.get('status')
    const applicationType = urlParams.get('application_type')
    const userId = urlParams.get('userId')

    // Build additional filters
    const additionalFilters: any = {}
    if (status) {
      additionalFilters.status = status
    }
    if (applicationType) {
      additionalFilters.application_type = applicationType
    }
    
    // Check if user is admin
    const supabase = await getSupabaseClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    
    // Regular users can only see their own applications
    // Admins can see all applications or filter by userId
    if (!isAdmin) {
      additionalFilters.user_id = user.id
    } else if (userId) {
      additionalFilters.user_id = userId
    }

    // Custom search logic for bidding applications
    if (searchQuery) {
      let customQuery = supabase
        .from('bidding_applications')
        .select('*', { count: 'exact' })
        .or(`case_number.ilike.%${searchQuery}%,court_name.ilike.%${searchQuery}%,bidder_name.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%`)
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
          'Bidding applications fetched successfully'
        )
      )
    }

    // Use default service for non-search queries
    const { data, total } = await biddingApplicationService.getAll(request, '*', additionalFilters)

    return NextResponse.json(
      formatPaginatedResponse(
        data,
        {
          page: pagination.page!,
          limit: pagination.limit!,
          total,
        },
        'Bidding applications fetched successfully'
      )
    )
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/bidding-applications - Submit a new bidding application
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    const body = await parseRequestBody(request)
    
    const validationError = validateRequiredFields(body, ['case_number', 'court_name', 'bid_date', 'bid_amount', 'application_type'])
    if (validationError) {
      throw new ApiError(400, validationError)
    }

    const createData: BiddingApplicationCreateRequest = body
    
    // Validate application type and required fields based on type
    if (!['personal', 'company', 'group'].includes(createData.application_type)) {
      throw new ApiError(400, 'Invalid application type')
    }

    const application = await biddingApplicationService.create({
      user_id: user.id,
      ...createData,
      status: 'pending',
      phone_verified: false,
      has_signature: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json(
      formatResponse(application, 'Bidding application submitted successfully'),
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/bidding-applications - Update a bidding application
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    const body = await parseRequestBody(request)
    
    const validationError = validateRequiredFields(body, ['id'])
    if (validationError) {
      throw new ApiError(400, validationError)
    }

    const { id, ...updateData }: BiddingApplicationUpdateRequest = body

    // Check if user owns the application or is admin
    const application = await biddingApplicationService.getById(id)
    
    const supabase = await getSupabaseClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    
    if (application.user_id !== user.id && !isAdmin) {
      throw new ApiError(403, 'You can only update your own applications')
    }

    // Regular users can only update certain fields, admins can update status and assignment
    if (!isAdmin) {
      // Remove admin-only fields from update data
      delete updateData.status
      delete updateData.assigned_expert_id
    }

    const updatedApplication = await biddingApplicationService.update(id, {
      ...updateData,
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json(
      formatResponse(updatedApplication, 'Bidding application updated successfully')
    )
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/bidding-applications - Delete a bidding application
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    const body = await parseRequestBody(request)
    
    const validationError = validateRequiredFields(body, ['id'])
    if (validationError) {
      throw new ApiError(400, validationError)
    }

    const { id } = body

    // Check if user owns the application or is admin
    const application = await biddingApplicationService.getById(id)
    
    const supabase = await getSupabaseClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    
    if (application.user_id !== user.id && !isAdmin) {
      throw new ApiError(403, 'You can only delete your own applications')
    }

    // Only allow deletion if application is in pending status
    if (application.status !== 'pending' && !isAdmin) {
      throw new ApiError(400, 'You can only delete pending applications')
    }

    await biddingApplicationService.delete(id)

    return NextResponse.json(
      formatResponse(undefined, 'Bidding application deleted successfully')
    )
  } catch (error) {
    return handleApiError(error)
  }
}
