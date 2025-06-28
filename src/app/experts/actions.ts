'use server'

import { createClient } from '@/utils/supabase/server'
import { Expert, ExpertCreateRequest, ExpertUpdateRequest } from '@/types/api'

// Fetch experts with optional filters and search
export async function fetchExperts(options?: {
  search?: string
  location?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  const supabase = await createClient()

  try {
    const {
      search,
      location,
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options || {}

    let query = supabase
      .from('experts')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%,services.cs.{${search}}`)
    }

    // Apply location filter
    if (location) {
      query = query.eq('location', location)
    }

    // Apply pagination and sorting
    query = query
      .range((page - 1) * limit, page * limit - 1)
      .order(sortBy, { ascending: sortOrder === 'asc' })

    const { data, error, count } = await query

    if (error) throw error

    return {
      data: data || [],
      total: count || 0,
      page,
      limit
    }
  } catch (error: any) {
    console.error('Error fetching experts:', error.message)
    throw new Error('Failed to fetch experts.')
  }
}

// Create a new expert
export async function createExpert(expertData: ExpertCreateRequest) {
  const supabase = await createClient()

  try {
    // Validate required fields
    if (!expertData.name || !expertData.location) {
      throw new Error('Name and location are required fields')
    }

    // Validate services array
    if (expertData.services && !Array.isArray(expertData.services)) {
      throw new Error('Services must be an array')
    }

    const newExpert = {
      ...expertData,
      availability: expertData.availability ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('experts')
      .insert([newExpert])
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error: any) {
    console.error('Error creating expert:', error.message)
    throw new Error(error.message || 'Failed to create expert.')
  }
}

// Update an existing expert
export async function updateExpert(expertData: ExpertUpdateRequest) {
  const supabase = await createClient()

  try {
    if (!expertData.id) {
      throw new Error('Expert ID is required')
    }

    // Validate services array if provided
    if (expertData.services && !Array.isArray(expertData.services)) {
      throw new Error('Services must be an array')
    }

    const { id, ...updateData } = expertData
    const updatedExpert = {
      ...updateData,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('experts')
      .update(updatedExpert)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error: any) {
    console.error('Error updating expert:', error.message)
    throw new Error(error.message || 'Failed to update expert.')
  }
}

// Delete an expert
export async function deleteExpert(expertId: string) {
  const supabase = await createClient()

  try {
    if (!expertId) {
      throw new Error('Expert ID is required')
    }

    const { error } = await supabase
      .from('experts')
      .delete()
      .eq('id', expertId)

    if (error) throw error

    return { success: true, message: 'Expert deleted successfully' }
  } catch (error: any) {
    console.error('Error deleting expert:', error.message)
    throw new Error(error.message || 'Failed to delete expert.')
  }
}

// Get a single expert by ID
export async function getExpertById(expertId: string) {
  const supabase = await createClient()

  try {
    if (!expertId) {
      throw new Error('Expert ID is required')
    }

    const { data, error } = await supabase
      .from('experts')
      .select('*')
      .eq('id', expertId)
      .single()

    if (error) throw error

    return data
  } catch (error: any) {
    console.error('Error fetching expert:', error.message)
    throw new Error('Failed to fetch expert.')
  }
}
