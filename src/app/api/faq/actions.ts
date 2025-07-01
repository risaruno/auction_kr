'use server'

import { createClient } from '@/utils/supabase/server'
import { FAQ, FAQCreateRequest, FAQUpdateRequest } from '@/types/api'

// Fetch FAQs with optional filters and search
export async function fetchFaqs(options?: {
  search?: string
  category?: string
  published?: boolean
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  const supabase = await createClient()

  try {
    const {
      search,
      category,
      published,
      page = 1,
      limit = 20,
      sortBy = 'order',
      sortOrder = 'asc'
    } = options || {}

    let query = supabase
      .from('faqs')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (search) {
      query = query.or(`question.ilike.%${search}%,answer.ilike.%${search}%`)
    }

    // Apply category filter
    if (category) {
      query = query.eq('category', category)
    }

    // Apply published filter
    if (published !== undefined) {
      query = query.eq('is_published', published)
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
    console.error('Error fetching FAQs:', error.message)
    throw new Error('Failed to fetch FAQs.')
  }
}

// Create a new FAQ
export async function createFaq(faqData: FAQCreateRequest) {
  const supabase = await createClient()

  try {
    // Validate required fields
    if (!faqData.question || !faqData.answer || !faqData.category) {
      throw new Error('Question, answer, and category are required fields')
    }

    const newFaq = {
      ...faqData,
      is_published: faqData.is_published ?? true,
      order: faqData.order ?? 0,
      created_at: new Date().toISOString(),
      edited_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('faqs')
      .insert([newFaq])
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error: any) {
    console.error('Error creating FAQ:', error.message)
    throw new Error(error.message || 'Failed to create FAQ.')
  }
}

// Update an existing FAQ
export async function updateFaq(faqData: FAQUpdateRequest) {
  const supabase = await createClient()

  try {
    if (!faqData.id) {
      throw new Error('FAQ ID is required')
    }

    const { id, ...updateData } = faqData
    const updatedFaq = {
      ...updateData,
      edited_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('faqs')
      .update(updatedFaq)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error: any) {
    console.error('Error updating FAQ:', error.message)
    throw new Error(error.message || 'Failed to update FAQ.')
  }
}

// Delete a FAQ
export async function deleteFaq(faqId: string) {
  const supabase = await createClient()

  try {
    if (!faqId) {
      throw new Error('FAQ ID is required')
    }

    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', faqId)

    if (error) throw error

    return { success: true, message: 'FAQ deleted successfully' }
  } catch (error: any) {
    console.error('Error deleting FAQ:', error.message)
    throw new Error(error.message || 'Failed to delete FAQ.')
  }
}

// Get a single FAQ by ID
export async function getFaqById(faqId: string) {
  const supabase = await createClient()

  try {
    if (!faqId) {
      throw new Error('FAQ ID is required')
    }

    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('id', faqId)
      .single()

    if (error) throw error

    return data
  } catch (error: any) {
    console.error('Error fetching FAQ:', error.message)
    throw new Error('Failed to fetch FAQ.')
  }
}

// Get FAQs by category (for public display)
export async function getFaqsByCategory(category?: string) {
  const supabase = await createClient()

  try {
    let query = supabase
      .from('faqs')
      .select('*')
      .eq('is_published', true)
      .order('order', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error

    return data || []
  } catch (error: any) {
    console.error('Error fetching FAQs by category:', error.message)
    throw new Error('Failed to fetch FAQs.')
  }
}
