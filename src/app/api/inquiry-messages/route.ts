import { NextRequest, NextResponse } from 'next/server'
import { 
  handleApiError, 
  validateRequiredFields, 
  formatResponse,
  CrudService,
  getPaginationParamsFromRequest,
  formatPaginatedResponse,
  ApiError,
  getAuthenticatedUser,
  getSupabaseClient,
  parseRequestBody
} from '@/utils/api-app'
import { InquiryMessage } from '@/types/api'

const messageService = new CrudService<InquiryMessage>('inquiry_messages')

// GET /api/inquiry-messages - Fetch messages for an inquiry
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    const { searchParams } = new URL(request.url)
    const inquiryId = searchParams.get('inquiryId')
    
    if (!inquiryId) {
      throw new ApiError(400, 'Inquiry ID is required')
    }

    // Check if user has access to this inquiry
    const supabase = await getSupabaseClient()
    
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .select('user_id')
      .eq('id', inquiryId)
      .single()

    if (inquiryError) throw inquiryError
    if (!inquiry) throw new ApiError(404, 'Inquiry not found')

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'

    // Regular users can only see messages from their own inquiries
    if (inquiry.user_id !== user.id && !isAdmin) {
      throw new ApiError(403, 'Access denied')
    }

    const pagination = getPaginationParamsFromRequest(request)

    const { data, error, count } = await supabase
      .from('inquiry_messages')
      .select('*', { count: 'exact' })
      .eq('inquiry_id', inquiryId)
      .range(
        (pagination.page! - 1) * pagination.limit!,
        pagination.page! * pagination.limit! - 1
      )
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json(
      formatPaginatedResponse(
        data || [],
        {
          page: pagination.page!,
          limit: pagination.limit!,
          total: count || 0,
        },
        'Messages fetched successfully'
      )
    )
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/inquiry-messages - Add a message to an inquiry
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    const body = await parseRequestBody(request)
    
    const validationError = validateRequiredFields(body, ['inquiry_id', 'message'])
    if (validationError) {
      throw new ApiError(400, validationError)
    }

    const { inquiry_id, message, attachments } = body

    // Check if user has access to this inquiry
    const supabase = await getSupabaseClient()
    
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .select('user_id, status')
      .eq('id', inquiry_id)
      .single()

    if (inquiryError) throw inquiryError
    if (!inquiry) throw new ApiError(404, 'Inquiry not found')

    // Check access permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    const isOwner = inquiry.user_id === user.id

    if (!isAdmin && !isOwner) {
      throw new ApiError(403, 'Access denied')
    }

    // Check if inquiry is closed
    if (inquiry.status === 'closed' && !isAdmin) {
      throw new ApiError(400, 'Cannot add messages to a closed inquiry')
    }

    // Create the message
    const newMessage = await messageService.create({
      inquiry_id,
      sender_id: user.id,
      sender_type: isAdmin ? 'admin' : 'user',
      message,
      attachments: attachments || [],
      created_at: new Date().toISOString(),
    })

    // Update inquiry status if it was new and admin is responding
    if (isAdmin && inquiry.status === 'new') {
      await supabase
        .from('inquiries')
        .update({ 
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', inquiry_id)
    }

    // Update inquiry status if user is responding and it was in_progress
    if (!isAdmin && inquiry.status === 'in_progress') {
      await supabase
        .from('inquiries')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('id', inquiry_id)
    }

    return NextResponse.json(
      formatResponse(newMessage, 'Message sent successfully'),
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
