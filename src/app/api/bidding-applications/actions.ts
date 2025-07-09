'use server'

import { createClient } from '@/utils/supabase/server'

// Fetch bidding applications with optional filters
export async function fetchBiddingApplications(options?: {
  status?: string
  expertId?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  const supabase = await createClient()

  try {
    const {
      status,
      expertId,
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options || {}

    let query = supabase
      .from('bidding_applications')
      .select(`
        *,
        user:profiles!bidding_applications_user_id_fkey(full_name, email),
        expert:experts!bidding_applications_expert_id_fkey(name)
      `, { count: 'exact' })

    // Apply status filter
    if (status) {
      query = query.eq('status', status)
    }

    // Apply expert filter
    if (expertId) {
      query = query.eq('expert_id', expertId)
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
  } catch (error: unknown) {
    console.error('Error fetching bidding applications:', (error as Error).message)
    throw new Error('Failed to fetch bidding applications.')
  }
}

// Update bidding application status
export async function updateBiddingApplicationStatus(
  applicationId: string, 
  status: string,
  expertId?: string
) {
  const supabase = await createClient()

  try {
    if (!applicationId) {
      throw new Error('Application ID is required')
    }

    const updateData: Record<string, unknown> = {
      status,
      edited_at: new Date().toISOString(),
    }

    if (expertId) {
      updateData.expert_id = expertId
    }

    const { data, error } = await supabase
      .from('bidding_applications')
      .update(updateData)
      .eq('id', applicationId)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error: unknown) {
    console.error('Error updating bidding application:', (error as Error).message)
    throw new Error((error as Error).message || 'Failed to update bidding application.')
  }
}

// Assign expert to bidding application
export async function assignExpertToBid(applicationId: string, expertId: string) {
  const supabase = await createClient()

  try {
    if (!applicationId || !expertId) {
      throw new Error('Application ID and Expert ID are required')
    }

    const { data, error } = await supabase
      .from('bidding_applications')
      .update({
        expert_id: expertId,
        status: 'expert_assigned',
        edited_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error: unknown) {
    console.error('Error assigning expert to bid:', (error as Error).message)
    throw new Error((error as Error).message || 'Failed to assign expert.')
  }
}

// Update payment status
export async function updatePaymentStatus(applicationId: string, paymentStatus: string) {
  const supabase = await createClient()

  try {
    if (!applicationId) {
      throw new Error('Application ID is required')
    }

    const { data, error } = await supabase
      .from('bidding_applications')
      .update({
        payment_status: paymentStatus,
        edited_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error: unknown) {
    console.error('Error updating payment status:', (error as Error).message)
    throw new Error((error as Error).message || 'Failed to update payment status.')
  }
}

// Update deposit status
export async function updateDepositStatus(applicationId: string, depositStatus: string) {
  const supabase = await createClient()

  try {
    if (!applicationId) {
      throw new Error('Application ID is required')
    }

    const { data, error } = await supabase
      .from('bidding_applications')
      .update({
        deposit_status: depositStatus,
        edited_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error: unknown) {
    console.error('Error updating deposit status:', (error as Error).message)
    throw new Error((error as Error).message || 'Failed to update deposit status.')
  }
}

// Add bid result notes
export async function updateBidResult(applicationId: string, resultNotes: string, bidResult?: string) {
  const supabase = await createClient()

  try {
    if (!applicationId) {
      throw new Error('Application ID is required')
    }

    const updateData: Record<string, unknown> = {
      result_notes: resultNotes,
      edited_at: new Date().toISOString(),
    }

    if (bidResult) {
      updateData.result = bidResult
      updateData.status = 'completed'
    }

    const { data, error } = await supabase
      .from('bidding_applications')
      .update(updateData)
      .eq('id', applicationId)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error: unknown) {
    console.error('Error updating bid result:', (error as Error).message)
    throw new Error((error as Error).message || 'Failed to update bid result.')
  }
}

// Get single bidding application with details
export async function getBiddingApplicationById(applicationId: string) {
  const supabase = await createClient()

  try {
    if (!applicationId) {
      throw new Error('Application ID is required')
    }    const { data, error } = await supabase
      .from('bidding_applications')
      .select(`
        *,
        user:profiles!bidding_applications_user_id_fkey(full_name, email, phone),
        expert:experts!bidding_applications_expert_id_fkey(name, location, description)
      `)
      .eq('id', applicationId)
      .single()

    if (error) throw error

    return data
  } catch (error: unknown) {
    console.error('Error fetching bidding application:', (error as Error).message)
    throw new Error('Failed to fetch bidding application.')
  }
}
