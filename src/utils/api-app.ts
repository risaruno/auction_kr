import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api'

// Enhanced error handling with proper logging
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Standard response formatter
export function formatResponse<T>(
  data?: T,
  message?: string,
  error?: string
): ApiResponse<T> {
  return {
    success: !error,
    data,
    message,
    error,
  }
}

// Paginated response formatter
export function formatPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
  },
  message?: string
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    message,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  }
}

// Enhanced error handler for App Router
export function handleApiError(error: unknown): NextResponse {
  const err = error as Error & { code?: string; statusCode?: number }
  
  console.error('API Error:', {
    message: err.message || 'Unknown error',
    stack: err.stack,
    timestamp: new Date().toISOString(),
  })

  if (error instanceof ApiError) {
    return NextResponse.json(
      formatResponse(undefined, undefined, error.message),
      { status: error.statusCode }
    )
  }

  // Supabase specific errors
  if (err.code) {
    switch (err.code) {
      case 'PGRST116':
        return NextResponse.json(
          formatResponse(undefined, undefined, 'Resource not found'),
          { status: 404 }
        )
      case '23505':
        return NextResponse.json(
          formatResponse(undefined, undefined, 'Resource already exists'),
          { status: 409 }
        )
      case '23503':
        return NextResponse.json(
          formatResponse(undefined, undefined, 'Invalid reference'),
          { status: 400 }
        )
      default:
        return NextResponse.json(
          formatResponse(undefined, undefined, 'Database operation failed'),
          { status: 500 }
        )
    }
  }

  // Generic server error
  return NextResponse.json(
    formatResponse(undefined, undefined, 'Internal server error'),
    { status: 500 }
  )
}

// Request validation
export function validateRequiredFields(
  body: Record<string, unknown>,
  requiredFields: string[]
): string | null {
  const missingFields = requiredFields.filter(field => 
    body[field] === undefined || body[field] === null || body[field] === ''
  )
  
  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(', ')}`
  }
  
  return null
}

// Supabase client factory with error handling
export async function getSupabaseClient(adminRequired: boolean = false) {
  try {
    return adminRequired ? await createAdminClient() : await createClient()
  } catch {
    throw new ApiError(500, 'Failed to initialize database connection')
  }
}

// Pagination helper for App Router
export function getPaginationParamsFromRequest(request: NextRequest): PaginationParams {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
  const sortBy = searchParams.get('sortBy') || 'created_at'
  const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
  
  return { page, limit, sortBy, sortOrder }
}

// Search helper for App Router
export function getSearchQueryFromRequest(request: NextRequest): string | undefined {
  const { searchParams } = new URL(request.url)
  return searchParams.get('q') || undefined
}

// Get query parameter helper
export function getQueryParam(request: NextRequest, key: string): string | undefined {
  const { searchParams } = new URL(request.url)
  return searchParams.get(key) || undefined
}

// Generic CRUD operations for App Router
export class CrudService<T> {
  constructor(
    private tableName: string,
    private adminRequired: boolean = false
  ) {}

  async getAll(
    request: NextRequest,
    selectFields: string = '*',
    additionalFilters?: Record<string, unknown>
  ): Promise<{ data: T[]; total: number }> {
    const supabase = await getSupabaseClient(this.adminRequired)
    const pagination = getPaginationParamsFromRequest(request)
    const searchQuery = getSearchQueryFromRequest(request)
    
    let query = supabase
      .from(this.tableName)
      .select(selectFields, { count: 'exact' })
      .range(
        (pagination.page! - 1) * pagination.limit!,
        pagination.page! * pagination.limit! - 1
      )
      .order(pagination.sortBy!, { ascending: pagination.sortOrder === 'asc' })

    // Apply additional filters if provided
    if (additionalFilters) {
      Object.entries(additionalFilters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    // Apply search if provided (this should be customized per table)
    if (searchQuery) {
      // This is a generic implementation - should be overridden for specific search needs
      query = query.ilike('name', `%${searchQuery}%`)
    }

    const { data, error, count } = await query

    if (error) throw error

    return { data: (data || []) as T[], total: count || 0 }
  }

  async getById(id: string, selectFields: string = '*'): Promise<T> {
    const supabase = await getSupabaseClient(this.adminRequired)
    
    const { data, error } = await supabase
      .from(this.tableName)
      .select(selectFields)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) throw new ApiError(404, `${this.tableName} not found`)

    return data as T
  }

  async create(createData: Partial<T>): Promise<T> {
    const supabase = await getSupabaseClient(this.adminRequired)
    
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([createData])
      .select()
      .single()

    if (error) throw error

    return data as T
  }

  async update(id: string, updateData: Partial<T>): Promise<T> {
    const supabase = await getSupabaseClient(this.adminRequired)
    
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!data) throw new ApiError(404, `${this.tableName} not found`)

    return data as T
  }

  async delete(id: string): Promise<void> {
    const supabase = await getSupabaseClient(this.adminRequired)
    
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Authentication helper for App Router
export async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authorization header required')
  }

  const token = authHeader.substring(7)
  const supabase = await getSupabaseClient()
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    throw new ApiError(401, 'Invalid or expired token')
  }

  return user
}

// Admin authentication helper for App Router
export async function requireAdmin(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  
  // Check if user has admin role
  const supabase = await getSupabaseClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new ApiError(403, 'Admin access required')
  }

  return user
}

// JSON body parser for NextRequest
export async function parseRequestBody(request: NextRequest) {
  try {
    return await request.json()
  } catch {
    throw new ApiError(400, 'Invalid JSON body')
  }
}
