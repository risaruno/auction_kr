import { CaseResult } from "./CaseResult";

export type ApplicationType = 'personal' | 'company' | 'group';

export interface FormData {
  caseResult: CaseResult | null;
  applicationType: ApplicationType;
  bidAmt: string;
  
  // Personal/Company fields
  bidderName: string;
  residentId1: string;
  residentId2: string;
  phoneNumber: string;
  zipNo: string;
  roadAddr: string;
  addrDetail: string;
  
  // Company specific fields
  companyName?: string;
  businessNumber?: string;
  representativeName?: string;
  companyPhoneNumber?: string;
  companyZipNo?: string;
  companyRoadAddr?: string;
  companyAddrDetail?: string;
  
  // Group specific fields
  groupRepresentativeName?: string;
  groupRepresentativeId1?: string;
  groupRepresentativeId2?: string;
  groupMemberCount?: number;
  groupMembers?: Array<{
    name: string;
    residentId1: string;
    residentId2: string;
  }>;
  
  // Bank account info
  bank: string;
  accountNumber: string;
  
  // Verification
  isPhoneVerified: boolean;
  otpCode: string;
  
  // Contract and payment
  signature: string | null;
  termsChecked: boolean;
  pointsUsed: number;
  fee: string;
  feePaidOn: string;
}

export const InitialFormData: FormData = {
  caseResult: null,
  applicationType: 'personal',
  bidAmt: "",
  bidderName: "",
  residentId1: "",
  residentId2: "",
  phoneNumber: "",
  zipNo: "",
  roadAddr: "",
  addrDetail: "",
  bank: "",
  accountNumber: "",
  isPhoneVerified: false,
  otpCode: "",
  signature: null,
  termsChecked: false,
  pointsUsed: 0,
  fee: "100000",
  feePaidOn: "대리입찰 접수 시",
};
