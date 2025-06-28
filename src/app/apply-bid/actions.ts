'use server'

import { createClient } from '@/utils/supabase/server'
import { FormData, InitialFormData } from '@/interfaces/FormData'
import axios from 'axios'
import { CourtAuctionData } from '@/types/api'


export interface ApplyBidState {
  error: string | null
  message: string | null
}

export interface CourtAuctionState {
  success: boolean
  data: CourtAuctionData | null
  error: string | null
}

export async function getCourtAuctionData(
  cortOfcCd: string,
  csNo: string
): Promise<CourtAuctionState> {
  try {
    // Validate required fields
    if (!cortOfcCd || !csNo) {
      return {
        success: false,
        data: null,
        error: 'Court office code and case number are required'
      }
    }

    const commonHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json',
      'Accept-Language': 'ko-KR,ko;q=0.9',
      'Origin': 'https://www.courtauction.go.kr',
      'Referer': 'https://www.courtauction.go.kr/pgj/PGJ15A.jsp',
      'X-Requested-With': 'XMLHttpRequest',
    }

    // --- Step 1: First fetch for auction base info ---
    const url1 = 'https://www.courtauction.go.kr/pgj/pgj15A/selectAuctnCsSrchRslt.on'
    const payload1 = { dma_srchCsDtlInf: { cortOfcCd, csNo } }

    const response1 = await axios.post(url1, payload1, { 
      headers: commonHeaders,
      timeout: 10000 // 10 second timeout
    })
    
    const json1 = response1.data

    if (!json1.data || !json1.data.dlt_dspslGdsDspslObjctLst?.[0]) {
      return {
        success: false,
        data: null,
        error: 'No auction item found'
      }
    }

    const item = json1.data.dlt_dspslGdsDspslObjctLst[0]
    const auctionData: CourtAuctionData = {
      courtName: json1.data.dma_csBasInf.cortOfcNm,
      caseNumber: json1.data.dma_csBasInf.csNo,
      printCaseNumber: json1.data.dma_csBasInf.userCsNo,
      evaluationAmt: item.aeeEvlAmt,
      lowestBidAmt: item.fstPbancLwsDspslPrc,
      depositAmt: Math.floor(item.fstPbancLwsDspslPrc / 10),
      bidDate: item.dspslDxdyYmd,
    }

    // --- Step 2: Second fetch for picture data ---
    try {
      const url2 = 'https://www.courtauction.go.kr/pgj/pgj15B/selectAuctnCsSrchRslt.on'
      const payload2 = {
        dma_srchGdsDtlSrch: {
          csNo: auctionData.caseNumber,
          cortOfcCd,
          dspslGdsSeq: 1,
          pgmId: 'PGJ15AF01',
          srchInfo: { menuNm: '경매사건검색', sideDvsCd: '2' },
        },
      }

      const response2 = await axios.post(url2, payload2, { 
        headers: commonHeaders,
        timeout: 5000 // 5 second timeout for images
      })
      
      const json2 = response2.data
      const picFile = json2?.data?.dma_result?.csPicLst?.[0]?.picFile || null
      
      auctionData.picFile = picFile
    } catch (imageError) {
      // Don't fail the entire request if image fetch fails
      console.warn('Failed to fetch auction image:', imageError)
      auctionData.picFile = undefined
    }

    return {
      success: true,
      data: auctionData,
      error: null
    }

  } catch (error: any) {
    console.error('Court auction lookup error:', error)

    // Handle axios errors specifically
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          data: null,
          error: 'Request timeout - court system may be slow'
        }
      } else if (error.response?.status === 404) {
        return {
          success: false,
          data: null,
          error: 'Auction case not found'
        }
      } else if (error.response && error.response.status >= 500) {
        return {
          success: false,
          data: null,
          error: 'Court system is temporarily unavailable'
        }
      } else {
        return {
          success: false,
          data: null,
          error: 'Failed to fetch auction data from court system'
        }
      }
    }
    
    return {
      success: false,
      data: null,
      error: 'An unexpected error occurred while fetching auction data'
    }
  }
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
