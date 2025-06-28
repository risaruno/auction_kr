import { NextRequest, NextResponse } from 'next/server'
import { 
  handleApiError, 
  validateRequiredFields, 
  formatResponse,
  CrudService,
  getPaginationParamsFromRequest,
  formatPaginatedResponse,
  getSearchQueryFromRequest,
  getQueryParam,
  ApiError,
  getSupabaseClient
} from '@/utils/api-app'
import { Expert, ExpertCreateRequest, ExpertUpdateRequest } from '@/types/api'

const expertService = new CrudService<Expert>('experts')

export async function GET(request: NextRequest) {
  try {
    const pagination = getPaginationParamsFromRequest(request)
    const searchQuery = getSearchQueryFromRequest(request)
    const location = getQueryParam(request, 'location')

    // Build additional filters
    const additionalFilters: any = {}
    if (location) {
      additionalFilters.location = location
    }

    // Custom search logic for experts
    if (searchQuery) {
      const supabase = await getSupabaseClient()
      
      let customQuery = supabase
        .from('experts')
        .select('*', { count: 'exact' })
        .or(`name.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,services.cs.{${searchQuery}}`)
        .range(
          (pagination.page! - 1) * pagination.limit!,
          pagination.page! * pagination.limit! - 1
        )
        .order(pagination.sortBy!, { ascending: pagination.sortOrder === 'asc' })

      if (location) {
        customQuery = customQuery.eq('location', location)
      }

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
          'Experts fetched successfully'
        )
      )
    }

    // Use default service for non-search queries
    const { data, total } = await expertService.getAll(request, '*', additionalFilters)

    return NextResponse.json(
      formatPaginatedResponse(
        data,
        {
          page: pagination.page!,
          limit: pagination.limit!,
          total,
        },
        'Experts fetched successfully'
      )
    )

  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationError = validateRequiredFields(body, ['name', 'location'])
    if (validationError) {
      throw new ApiError(400, validationError)
    }

    const createData: ExpertCreateRequest = body
    
    // Validate services array
    if (createData.services && !Array.isArray(createData.services)) {
      throw new ApiError(400, 'Services must be an array')
    }

    const expert = await expertService.create({
      ...createData,
      availability: createData.availability ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json(
      formatResponse(expert, 'Expert created successfully'),
      { status: 201 }
    )

  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validationError = validateRequiredFields(body, ['id'])
    if (validationError) {
      throw new ApiError(400, validationError)
    }

    const { id, ...updateData }: ExpertUpdateRequest = body

    // Validate services array if provided
    if (updateData.services && !Array.isArray(updateData.services)) {
      throw new ApiError(400, 'Services must be an array')
    }

    const expert = await expertService.update(id, {
      ...updateData,
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json(
      formatResponse(expert, 'Expert updated successfully')
    )

  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const validationError = validateRequiredFields(body, ['id'])
    if (validationError) {
      throw new ApiError(400, validationError)
    }

    const { id } = body
    await expertService.delete(id)

    return NextResponse.json(
      formatResponse(undefined, 'Expert deleted successfully')
    )

  } catch (error) {
    return handleApiError(error)
  }
}
