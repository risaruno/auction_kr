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
    const baseApplicationData = {
      user_id: user.id, // Link the application to the logged-in user
      case_number: caseResult.data.caseNumber,
      court_name: caseResult.data.courtName,
      bid_date: caseResult.data.bidDate,
      bid_amount: Number(bidAmt.replace(/[^0-9]/g, '')), // Ensure bidAmt is a number
      application_type: formData.applicationType,
      phone_verified: formData.isPhoneVerified,
      has_signature: formData.signature !== null,
      bank: formData.bank,
      account_number: formData.accountNumber,
    };

    // Add type-specific data
    let applicationData: any = { ...baseApplicationData };

    if (formData.applicationType === 'personal') {
      applicationData = {
        ...applicationData,
        bidder_name: formData.bidderName,
        resident_id1: formData.residentId1,
        resident_id2: formData.residentId2,
        phone_number: formData.phoneNumber,
        zip_no: formData.zipNo,
        road_addr: formData.roadAddr,
        addr_detail: formData.addrDetail,
      };
    } else if (formData.applicationType === 'company') {
      applicationData = {
        ...applicationData,
        company_name: formData.companyName,
        business_number: formData.businessNumber,
        representative_name: formData.representativeName,
        company_phone: formData.companyPhoneNumber,
        company_zip_no: formData.companyZipNo,
        company_road_addr: formData.companyRoadAddr,
        company_addr_detail: formData.companyAddrDetail,
      };
    } else if (formData.applicationType === 'group') {
      applicationData = {
        ...applicationData,
        group_representative_name: formData.groupRepresentativeName,
        group_representative_id1: formData.groupRepresentativeId1,
        group_representative_id2: formData.groupRepresentativeId2,
        group_member_count: formData.groupMemberCount,
        group_members: JSON.stringify(formData.groupMembers || []),
        phone_number: formData.phoneNumber,
        zip_no: formData.zipNo,
        road_addr: formData.roadAddr,
        addr_detail: formData.addrDetail,
      };
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
