'use server'

import { createClient } from '@/utils/supabase/server'

export async function fetchExperts() {
  const supabase = await createClient()

  try {
    // Fetch experts from the database
    const { data, error } = await supabase.from('experts').select('*')
    if (error) throw error

    return data // Return the fetched experts
  } catch (error: any) {
    console.error('Error fetching experts:', error.message)
    throw new Error('Failed to fetch experts.')
  }
}
