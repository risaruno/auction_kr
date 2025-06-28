import axios from 'axios'
import { NextRequest, NextResponse } from 'next/server'
import { 
  handleApiError, 
  validateRequiredFields, 
  formatResponse,
  ApiError,
  parseRequestBody
} from '@/utils/api-app'
import { CourtAuctionRequest, CourtAuctionData } from '@/types/api'

// POST /api/court-auction - Fetch court auction data
export async function POST(request: NextRequest) {
  try {
    const body = await parseRequestBody(request)
    
    const validationError = validateRequiredFields(body, ['cortOfcCd', 'csNo'])
    if (validationError) {
      throw new ApiError(400, validationError)
    }

    const { cortOfcCd, csNo }: CourtAuctionRequest = body

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
      throw new ApiError(404, 'No auction item found')
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

    return NextResponse.json(
      formatResponse(auctionData, 'Court auction data fetched successfully')
    )

  } catch (error) {
    // Handle axios errors specifically
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new ApiError(408, 'Request timeout - court system may be slow')
      } else if (error.response?.status === 404) {
        throw new ApiError(404, 'Auction case not found')
      } else if (error.response && error.response.status >= 500) {
        throw new ApiError(502, 'Court system is temporarily unavailable')
      } else {
        throw new ApiError(500, 'Failed to fetch auction data from court system')
      }
    }
    
    return handleApiError(error)
  }
}
