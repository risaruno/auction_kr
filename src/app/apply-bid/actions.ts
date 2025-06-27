'use server'

import { createClient } from '@/utils/supabase/server'
import { FormData, InitialFormData } from '@/interfaces/FormData';


export interface ApplyBidState {
  error: string | null
  message: string | null
}

export async function applyBid(
  userToken: string,
  formData: FormData
): Promise<ApplyBidState> {
  const supabase = await createClient()

  try {
    // 1. Get the logged-in user from the access token
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(userToken)

    if (userError || !user) {
      return {
        error: 'Unauthorized: You must be logged in to submit an application.',
        message: null,
      }
    }

    // 2. Validate the form data
    const { caseResult, bidAmt } = formData

    if (!caseResult?.data || !bidAmt) {
      return {
        error: 'Case information and bid amount are required.',
        message: null,
      }
    }

    // 3. Prepare the data for insertion into the 'bidding_applications' table
    const applicationData = {
      user_id: user.id, // Link the application to the logged-in user
      case_number: caseResult.data.caseNumber,
      court_name: caseResult.data.courtName,
      bid_date: caseResult.data.bidDate,
      bid_amount: Number(bidAmt.replace(/,/g, '')), // Ensure bidAmt is a number
    }

    // 4. Insert the new application into the database
    const { data, error: insertError } = await supabase
      .from('bidding_applications')
      .insert([applicationData])
      .select()
      .single()

    if (insertError) throw insertError

    // 5. Return success message
    return {
      error: null,
      message: 'Application submitted successfully!',
    }
  } catch (error: any) {
    console.error('Bid submission error:', error.message)
    return {
      error: 'Failed to submit application.',
      message: null,
    }
  }
}
