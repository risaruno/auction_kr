'use server'

import { createClient } from '@/utils/supabase/server'
import { FormData } from '@/interfaces/FormData'
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
    // 필수 필드 검증
    if (!cortOfcCd || !csNo) {
      return {
        success: false,
        data: null,
        error: '법원 사무소 코드와 사건번호가 필요합니다',
      }
    }

    const commonHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
      Accept: 'application/json',
      'Accept-Language': 'ko-KR,ko;q=0.9',
      Origin: 'https://www.courtauction.go.kr',
      Referer: 'https://www.courtauction.go.kr/pgj/PGJ15A.jsp',
      'X-Requested-With': 'XMLHttpRequest',
    }

    // --- 1단계: 경매 기본 정보 첫 번째 요청 ---
    const url1 =
      'https://www.courtauction.go.kr/pgj/pgj15A/selectAuctnCsSrchRslt.on'
    const payload1 = { dma_srchCsDtlInf: { cortOfcCd, csNo } }

    const response1 = await axios.post(url1, payload1, {
      headers: commonHeaders,
      timeout: 10000, // 10초 타임아웃
    })

    const json1 = response1.data

    if (!json1.data || !json1.data.dlt_dspslGdsDspslObjctLst?.[0]) {
      return {
        success: false,
        data: null,
        error: '경매 물건을 찾을 수 없습니다',
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

    // 입찰 시간이 지났는지 확인 (오늘 오전 10시 이후)
    try {
      const bidDateStr = auctionData.bidDate
      const today = new Date()
      const bidDate = new Date(
        bidDateStr.slice(0, 4) +
          '-' +
          bidDateStr.slice(4, 6) +
          '-' +
          bidDateStr.slice(6, 8)
      )

      const isSameDayOrPast = bidDate <= today

      if (isSameDayOrPast) {
        const currentHour = today.getHours()
        const currentMinute = today.getMinutes()
        const currentTimeInMinutes = currentHour * 60 + currentMinute
        const bidDeadlineInMinutes = 10 * 60 // 오전 10시 (분 단위)

        if (
          bidDate.toDateString() === today.toDateString() &&
          currentTimeInMinutes >= bidDeadlineInMinutes
        ) {
          return {
            success: false,
            data: null,
            error: '이 경매 사건 입찰 신청 시간은 이미 지났습니다.',
          }
        } else if (bidDate < today) {
          return {
            success: false,
            data: null,
            error: '이 경매 사건 입찰 신청 시간은 이미 지났습니다.',
          }
        }
      }
    } catch (dateError) {
      console.warn('입찰일 시간 검증을 위한 날짜 파싱 오류:', dateError)
      // 날짜 파싱이 실패해도 전체 요청을 실패시키지 않음
    }

    // --- 2단계: 사진 데이터 두 번째 요청 ---
    try {
      const url2 =
        'https://www.courtauction.go.kr/pgj/pgj15B/selectAuctnCsSrchRslt.on'
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
        timeout: 5000, // 이미지용 5초 타임아웃
      })

      const json2 = response2.data
      const picFile = json2?.data?.dma_result?.csPicLst?.[0]?.picFile || null

      auctionData.picFile = picFile
    } catch (imageError) {
      // 이미지 가져오기가 실패해도 전체 요청을 실패시키지 않음
      console.warn('경매 이미지 가져오기 실패:', imageError)
      auctionData.picFile = undefined
    }

    return {
      success: true,
      data: auctionData,
      error: null,
    }
  } catch (error: unknown) {
    console.error('법원 경매 조회 오류:', error)

    // axios 오류를 구체적으로 처리
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          data: null,
          error: '요청 시간 초과 - 법원 시스템이 느릴 수 있습니다',
        }
      } else if (error.response?.status === 404) {
        return {
          success: false,
          data: null,
          error: '경매 사건을 찾을 수 없습니다',
        }
      } else if (error.response && error.response.status >= 500) {
        return {
          success: false,
          data: null,
          error: '법원 시스템이 일시적으로 사용할 수 없습니다',
        }
      } else {
        return {
          success: false,
          data: null,
          error: '법원 시스템에서 경매 데이터를 가져오지 못했습니다',
        }
      }
    }

    return {
      success: false,
      data: null,
      error: '경매 데이터를 가져오는 중 예상치 못한 오류가 발생했습니다',
    }
  }
}

export async function applyBid(
  userToken: string,
  formData: FormData
): Promise<ApplyBidState> {
  const supabase = await createClient()

  try {
    // 1. 액세스 토큰에서 로그인한 사용자 가져오기
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(userToken)

    if (userError || !user) {
      return {
        error: '인증되지 않았습니다: 신청서를 제출하려면 로그인해야 합니다.',
        message: null,
      }
    }

    // 1.5. 사용자에게 프로필이 있는지 확인 (없으면 생성)
    const { error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code === 'PGRST116') {
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            admin_role: 'user',
          },
        ])

      if (createProfileError) {
        console.error('프로필 생성 실패:', createProfileError)
        return {
          error: '사용자 프로필 생성에 실패했습니다. 고객 지원에 문의하세요.',
          message: null,
        }
      }
    } else if (profileError) {
      console.error('사용자 프로필 확인 오류:', profileError)
      return {
        error: '사용자 프로필 확인 중 오류가 발생했습니다. 다시 시도해 주세요.',
        message: null,
      }
    }

    // 2. 폼 데이터 검증
    const { caseResult, bidAmt } = formData

    if (!caseResult?.data || !bidAmt) {
      return {
        error: '사건 정보와 입찰 금액이 필요합니다.',
        message: null,
      }
    }

    // 필수 필드에 대한 추가 검증
    if (!formData.bidderName) {
      return {
        error: '입찰자 이름이 필요합니다.',
        message: null,
      }
    }

    if (!formData.phoneNumber) {
      return {
        error: '전화번호가 필요합니다.',
        message: null,
      }
    }

    if (!formData.accountNumber) {
      return {
        error: '계좌번호가 필요합니다.',
        message: null,
      }
    }

    if (!formData.signature) {
      return {
        error: '전자 서명이 필요합니다.',
        message: null,
      }
    }

    if (!formData.termsChecked) {
      return {
        error: '약관 동의가 필요합니다.',
        message: null,
      }
    }

    // 3. 'bidding_applications' 테이블에 삽입할 데이터 준비
    const baseApplicationData = {
      user_id: user.id, // 신청서를 로그인한 사용자와 연결
      case_number: caseResult.data.caseNumber,
      print_case_number: caseResult.data.printCaseNumber,
      court_name: caseResult.data.courtName,
      bid_date: caseResult.data.bidDate,
      bid_amount: Number(bidAmt.replace(/[^0-9]/g, '')), // bidAmt가 숫자인지 확인
      evaluation_amount: caseResult.data.evaluationAmt,
      lowest_bid_amount: caseResult.data.lowestBidAmt,
      deposit_amount: caseResult.data.depositAmt,
      application_type: formData.applicationType,
      account_number: formData.accountNumber,
      account_holder: formData.bidderName,
      status: 'new',
      payment_status: 'pending',
      deposit_status: 'pending',
    }

    // 유형별 데이터 추가
    let applicationData: Record<string, unknown> = { ...baseApplicationData }

    if (formData.applicationType === 'personal') {
      applicationData = {
        ...applicationData,
        bidder_name: formData.bidderName,
        resident_id1: formData.residentId1,
        resident_id2: formData.residentId2,
        phone_number: formData.phoneNumber,
        zip_code: formData.zipNo,
        road_address: formData.roadAddr,
        address_detail: formData.addrDetail,
      }
    } else if (formData.applicationType === 'company') {
      applicationData = {
        ...applicationData,
        company_name: formData.companyName,
        business_number: formData.businessNumber,
        representative_name: formData.representativeName,
        company_phone: formData.companyPhoneNumber,
        company_zip_code: formData.companyZipNo,
        company_road_address: formData.companyRoadAddr,
        company_address_detail: formData.companyAddrDetail,
      }
    } else if (formData.applicationType === 'group') {
      applicationData = {
        ...applicationData,
        group_representative_name: formData.groupRepresentativeName,
        group_representative_id1: formData.groupRepresentativeId1,
        group_representative_id2: formData.groupRepresentativeId2,
        group_member_count: formData.groupMemberCount,
        phone_number: formData.phoneNumber,
        zip_code: formData.zipNo,
        road_address: formData.roadAddr,
        address_detail: formData.addrDetail,
      }
    }

    const { data, error: insertError } = await supabase
      .from('bidding_applications')
      .insert([applicationData])
      .select()
      .single()

    if (insertError) {
      console.error('데이터베이스 삽입 오류:', insertError)
      throw new Error(`데이터베이스 오류: ${insertError.message}`)
    }

    // 5. 성공 메시지 반환
    return {
      error: null,
      message: '신청서가 성공적으로 제출되었습니다!',
    }
  } catch (error: unknown) {
    console.error('입찰 제출 오류:', (error as Error).message)
    return {
      error: '신청서 제출에 실패했습니다.',
      message: null,
    }
  }
}
