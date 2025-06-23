import { CaseResult } from "./CaseResult";

export interface FormData {
  caseResult: CaseResult | null;
  bidAmt: string;
  residentId1: string;
  residentId2: string;
  bank: string;
  accountNumber: string;
  bidderName: string;
  phoneNumber: string;
  zipNo: string;
  roadAddr: string;
  addrDetail: string;
  signature: string | null;
  termsChecked: boolean;
  pointsUsed: number;
  fee: string;
  feePaidOn: string;
}

export const InitialFormData: FormData = {
  caseResult: null,
  bidAmt: "",
  residentId1: "",
  residentId2: "",
  bank: "",
  accountNumber: "",
  bidderName: "",
  phoneNumber: "",
  zipNo: "",
  roadAddr: "",
  addrDetail: "",
  signature: null,
  termsChecked: false,
  pointsUsed: 0,
  fee: "0",
  feePaidOn: "대리입찰 접수 시",
};
