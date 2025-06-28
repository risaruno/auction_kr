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
import { FAQ, FAQCreateRequest, FAQUpdateRequest } from '@/types/api'

const faqService = new CrudService<FAQ>('faqs')

export async function GET(request: NextRequest) {
  try {
    const pagination = getPaginationParamsFromRequest(request)
    const searchQuery = getSearchQueryFromRequest(request)
    const category = getQueryParam(request, 'category')
    const isPublished = getQueryParam(request, 'published')

    // Build additional filters
    const additionalFilters: any = {}
    if (category) {
      additionalFilters.category = category
    }
    if (isPublished !== undefined) {
      additionalFilters.is_published = isPublished === 'true'
    }

    // Custom search logic for FAQs
    if (searchQuery) {
      const supabase = await getSupabaseClient()
      
      let customQuery = supabase
        .from('faqs')
        .select('*', { count: 'exact' })
        .or(`question.ilike.%${searchQuery}%,answer.ilike.%${searchQuery}%`)
        .range(
          (pagination.page! - 1) * pagination.limit!,
          pagination.page! * pagination.limit! - 1
        )
        .order(pagination.sortBy!, { ascending: pagination.sortOrder === 'asc' })

      // Apply additional filters
      if (category) {
        customQuery = customQuery.eq('category', category)
      }
      if (isPublished !== undefined) {
        customQuery = customQuery.eq('is_published', isPublished === 'true')
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
          'FAQs fetched successfully'
        )
      )
    }

    // Use default service for non-search queries
    const { data, total } = await faqService.getAll(request, '*', additionalFilters)

    return NextResponse.json(
      formatPaginatedResponse(
        data,
        {
          page: pagination.page!,
          limit: pagination.limit!,
          total,
        },
        'FAQs fetched successfully'
      )
    )

  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationError = validateRequiredFields(body, ['question', 'answer', 'category'])
    if (validationError) {
      throw new ApiError(400, validationError)
    }

    const createData: FAQCreateRequest = body
    
    const faq = await faqService.create({
      ...createData,
      is_published: createData.is_published ?? true,
      order: createData.order ?? 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json(
      formatResponse(faq, 'FAQ created successfully'),
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

    const { id, ...updateData }: FAQUpdateRequest = body

    const faq = await faqService.update(id, {
      ...updateData,
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json(
      formatResponse(faq, 'FAQ updated successfully')
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
    await faqService.delete(id)

    return NextResponse.json(
      formatResponse(undefined, 'FAQ deleted successfully')
    )

  } catch (error) {
    return handleApiError(error)
  }
}
