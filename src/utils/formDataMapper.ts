// Utility functions to map FormData to database schema
import { FormData } from '@/interfaces/FormData';

export interface BiddingApplicationData {
  // Core application data
  case_number: string;
  court_name?: string;
  bid_date?: string;
  bid_amount: number;
  application_type: 'personal' | 'company' | 'group';
  
  // Personal/Individual fields
  bidder_name: string;
  resident_id1: string;
  resident_id2: string;
  phone_number: string;
  zip_code: string;
  road_address: string;
  address_detail: string;
  
  // Company fields
  company_name?: string;
  business_number?: string;
  representative_name?: string;
  company_phone?: string;
  company_zip_code?: string;
  company_road_address?: string;
  company_address_detail?: string;
  
  // Group fields
  group_representative_name?: string;
  group_representative_id1?: string;
  group_representative_id2?: string;
  group_member_count?: number;
  
  // Bank account info
  account_number: string;
  account_holder: string;
  bank_name: string;
  
  // Verification and contract
  verification_phone_verified: boolean;
  verification_otp_code?: string;
  electronic_signature?: string;
  terms_agreed: boolean;
  
  // Payment and fees
  points_used: number;
  actual_service_fee: number;
  fee_payment_timing: string;
  service_fee: number;
  
  // Status fields
  status: string;
  payment_status: string;
  deposit_status: string;
}

export interface GroupMemberData {
  member_name: string;
  member_resident_id1: string;
  member_resident_id2: string;
}

export function mapFormDataToBiddingApplication(formData: FormData): BiddingApplicationData {
  return {
    // Core application data
    case_number: formData.caseResult?.data?.caseNumber || '',
    court_name: formData.caseResult?.data?.courtName,
    bid_date: formData.caseResult?.data?.bidDate,
    bid_amount: parseFloat(formData.bidAmt.replace(/,/g, '')) || 0,
    application_type: formData.applicationType,
    
    // Personal/Individual fields
    bidder_name: formData.bidderName,
    resident_id1: formData.residentId1,
    resident_id2: formData.residentId2,
    phone_number: formData.phoneNumber,
    zip_code: formData.zipNo,
    road_address: formData.roadAddr,
    address_detail: formData.addrDetail,
    
    // Company fields (only for company applications)
    company_name: formData.applicationType === 'company' ? formData.companyName : undefined,
    business_number: formData.applicationType === 'company' ? formData.businessNumber : undefined,
    representative_name: formData.applicationType === 'company' ? formData.representativeName : undefined,
    company_phone: formData.applicationType === 'company' ? formData.companyPhoneNumber : undefined,
    company_zip_code: formData.applicationType === 'company' ? formData.companyZipNo : undefined,
    company_road_address: formData.applicationType === 'company' ? formData.companyRoadAddr : undefined,
    company_address_detail: formData.applicationType === 'company' ? formData.companyAddrDetail : undefined,
    
    // Group fields (only for group applications)
    group_representative_name: formData.applicationType === 'group' ? formData.groupRepresentativeName : undefined,
    group_representative_id1: formData.applicationType === 'group' ? formData.groupRepresentativeId1 : undefined,
    group_representative_id2: formData.applicationType === 'group' ? formData.groupRepresentativeId2 : undefined,
    group_member_count: formData.applicationType === 'group' ? formData.groupMemberCount : undefined,
    
    // Bank account info
    account_number: formData.accountNumber,
    account_holder: formData.bidderName, // Assuming account holder is the same as bidder
    bank_name: formData.bank,
    
    // Verification and contract
    verification_phone_verified: formData.isPhoneVerified,
    verification_otp_code: formData.isPhoneVerified ? undefined : formData.otpCode, // Clear OTP after verification
    electronic_signature: formData.signature || undefined,
    terms_agreed: formData.termsChecked,
    
    // Payment and fees
    points_used: formData.pointsUsed,
    actual_service_fee: parseFloat(formData.fee.replace(/,/g, '')) || 100000,
    fee_payment_timing: formData.feePaidOn,
    service_fee: 100000, // Default service fee
    
    // Status fields
    status: 'new',
    payment_status: 'pending',
    deposit_status: 'pending',
  };
}

export function mapFormDataToGroupMembers(formData: FormData): GroupMemberData[] {
  if (formData.applicationType !== 'group' || !formData.groupMembers) {
    return [];
  }
  
  return formData.groupMembers.map(member => ({
    member_name: member.name,
    member_resident_id1: member.residentId1,
    member_resident_id2: member.residentId2,
  }));
}

// Validation function to check if all required fields are present
export function validateFormDataForApplication(formData: FormData): string[] {
  const errors: string[] = [];
  
  // Common validations
  if (!formData.caseResult?.data?.caseNumber) errors.push('사건번호가 필요합니다.');
  if (!formData.bidAmt) errors.push('입찰금액이 필요합니다.');
  if (!formData.bidderName) errors.push('입찰자명이 필요합니다.');
  if (!formData.residentId1 || !formData.residentId2) errors.push('주민등록번호가 필요합니다.');
  if (!formData.phoneNumber) errors.push('전화번호가 필요합니다.');
  if (!formData.zipNo || !formData.roadAddr) errors.push('주소가 필요합니다.');
  if (!formData.bank || !formData.accountNumber) errors.push('계좌정보가 필요합니다.');
  if (!formData.isPhoneVerified) errors.push('전화번호 인증이 필요합니다.');
  if (!formData.signature) errors.push('전자서명이 필요합니다.');
  if (!formData.termsChecked) errors.push('약관동의가 필요합니다.');
  
  // Application type specific validations
  if (formData.applicationType === 'company') {
    if (!formData.companyName) errors.push('회사명이 필요합니다.');
    if (!formData.businessNumber) errors.push('사업자등록번호가 필요합니다.');
    if (!formData.representativeName) errors.push('대표자명이 필요합니다.');
  }
  
  if (formData.applicationType === 'group') {
    if (!formData.groupRepresentativeName) errors.push('조합 대표자명이 필요합니다.');
    if (!formData.groupRepresentativeId1 || !formData.groupRepresentativeId2) errors.push('조합 대표자 주민등록번호가 필요합니다.');
    if (!formData.groupMemberCount || formData.groupMemberCount < 2) errors.push('조합원 수는 2명 이상이어야 합니다.');
    if (!formData.groupMembers || formData.groupMembers.length < 1) errors.push('조합원 정보가 필요합니다.');
  }
  
  return errors;
}
