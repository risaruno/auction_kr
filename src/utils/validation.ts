import { FormData } from '@/interfaces/FormData';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Validate Korean resident ID format
export function validateResidentId(id1: string, id2: string): boolean {
  if (!id1 || !id2) return false;
  if (id1.length !== 6 || id2.length !== 7) return false;
  if (!/^\d{6}$/.test(id1) || !/^\d{7}$/.test(id2)) return false;
  return true;
}

// Validate Korean business number format (10 digits)
export function validateBusinessNumber(businessNumber: string): boolean {
  if (!businessNumber) return false;
  const cleaned = businessNumber.replace(/[^0-9]/g, '');
  return cleaned.length === 10;
}

// Validate Korean phone number
export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[^0-9]/g, '');
  return cleaned.length === 11 && cleaned.startsWith('010');
}

// Validate email format
export function validateEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate bid amount
export function validateBidAmount(bidAmt: string, minimumBid?: number): boolean {
  if (!bidAmt) return false;
  const amount = parseInt(bidAmt.replace(/[^0-9]/g, ''));
  if (isNaN(amount) || amount <= 0) return false;
  if (minimumBid && amount < minimumBid) return false;
  return true;
}

// Step 0: Case Find validation
export function validateCaseFind(formData: FormData): ValidationResult {
  const errors: ValidationError[] = [];

  if (!formData.caseResult || !formData.caseResult.data) {
    errors.push({
      field: 'caseResult',
      message: '경매 사건을 먼저 조회해주세요.'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Step 1: Input Form validation
export function validateInputForm(formData: FormData): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate bid amount
  if (!formData.bidAmt) {
    errors.push({
      field: 'bidAmt',
      message: '입찰가를 입력해주세요.'
    });
  } else {
    const minimumBid = formData.caseResult?.data?.lowestBidAmt || 0;
    if (!validateBidAmount(formData.bidAmt, minimumBid)) {
      errors.push({
        field: 'bidAmt',
        message: `입찰가는 ${minimumBid.toLocaleString()}원 이상이어야 합니다.`
      });
    }
  }

  // Validate based on application type
  if (formData.applicationType === 'personal') {
    // Personal application validation
    if (!formData.bidderName) {
      errors.push({ field: 'bidderName', message: '이름을 입력해주세요.' });
    }

    if (!validateResidentId(formData.residentId1, formData.residentId2)) {
      errors.push({ field: 'residentId', message: '올바른 주민등록번호를 입력해주세요.' });
    }

    if (!validatePhoneNumber(formData.phoneNumber)) {
      errors.push({ field: 'phoneNumber', message: '올바른 휴대폰 번호를 입력해주세요.' });
    }

    if (!formData.isPhoneVerified) {
      errors.push({ field: 'phoneVerification', message: '휴대폰 번호 인증을 완료해주세요.' });
    }

  } else if (formData.applicationType === 'company') {
    // Company application validation
    if (!formData.companyName) {
      errors.push({ field: 'companyName', message: '회사명을 입력해주세요.' });
    }

    if (!validateBusinessNumber(formData.businessNumber || '')) {
      errors.push({ field: 'businessNumber', message: '올바른 사업자등록번호를 입력해주세요.' });
    }

    if (!formData.representativeName) {
      errors.push({ field: 'representativeName', message: '대표자명을 입력해주세요.' });
    }

    if (!validatePhoneNumber(formData.companyPhoneNumber || '')) {
      errors.push({ field: 'companyPhoneNumber', message: '올바른 회사 전화번호를 입력해주세요.' });
    }

  } else if (formData.applicationType === 'group') {
    // Group application validation
    if (!formData.groupRepresentativeName) {
      errors.push({ field: 'groupRepresentativeName', message: '공동입찰 대표자명을 입력해주세요.' });
    }

    if (!validateResidentId(formData.groupRepresentativeId1 || '', formData.groupRepresentativeId2 || '')) {
      errors.push({ field: 'groupRepresentativeId', message: '공동입찰 대표자의 주민등록번호를 입력해주세요.' });
    }

    if (!formData.groupMemberCount || formData.groupMemberCount < 2) {
      errors.push({ field: 'groupMemberCount', message: '공동입찰자는 2명 이상이어야 합니다.' });
    }

    if (!formData.groupMembers || formData.groupMembers.length < (formData.groupMemberCount || 0)) {
      errors.push({ field: 'groupMembers', message: '모든 공동입찰자 정보를 입력해주세요.' });
    }
  }

  // Address validation (common for all types)
  if (!formData.zipNo || !formData.roadAddr) {
    errors.push({ field: 'address', message: '주소를 입력해주세요.' });
  }

  // Bank account validation
  if (!formData.bank) {
    errors.push({ field: 'bank', message: '은행을 선택해주세요.' });
  }

  if (!formData.accountNumber) {
    errors.push({ field: 'accountNumber', message: '계좌번호를 입력해주세요.' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Step 2: Contract Sign validation
export function validateContractSign(formData: FormData): ValidationResult {
  const errors: ValidationError[] = [];

  if (!formData.signature) {
    errors.push({
      field: 'signature',
      message: '전자서명을 완료해주세요.'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Step 3: Payment Form validation
export function validatePaymentForm(): ValidationResult {
  const errors: ValidationError[] = [];

  // if (!formData.termsChecked) {
  //   errors.push({
  //     field: 'termsChecked',
  //     message: '약관에 동의해주세요.'
  //   });
  // }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Step 4: Review validation (final check)
export function validateReview(formData: FormData): ValidationResult {
  // Run all previous validations
  const caseValidation = validateCaseFind(formData);
  const inputValidation = validateInputForm(formData);
  const contractValidation = validateContractSign(formData);
  const paymentValidation = validatePaymentForm();

  const allErrors = [
    ...caseValidation.errors,
    ...inputValidation.errors,
    ...contractValidation.errors,
    ...paymentValidation.errors
  ];

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}

// Get validation function for specific step
export function getValidationForStep(step: number): (formData: FormData) => ValidationResult {
  switch (step) {
    case 0: return validateCaseFind;
    case 1: return validateInputForm;
    case 2: return validateContractSign;
    case 3: return validatePaymentForm;
    case 4: return validateReview;
    default: return () => ({ isValid: true, errors: [] });
  }
}
