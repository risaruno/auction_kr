export interface CaseResult {
  error: string; // Add an optional error field to handle errors
  data: {
    picFile: string;
    courtName: string;
    caseNumber: string;
    printCaseNumber: string;
    evaluationAmt: number;
    lowestBidAmt: number;
    depositAmt: number;
    bidDate: string;
  } | null;
}
