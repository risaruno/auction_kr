export enum Bank {
  // Commercial Banks
  IBK = 'IBK', // 기업은행 (Industrial Bank of Korea)
  NONGHYUP = 'NONGHYUP', // 농협은행 (Nonghyup Bank)
  NONGHYUP_FEDERATION = 'NONGHYUP_FEDERATION', // 농협중앙회 (Nonghyup Federation)
  SHINHAN = 'SHINHAN', // 신한은행 (Shinhan Bank)
  KDB = 'KDB', // 산업은행 (Korea Development Bank)
  WOORI = 'WOORI', // 우리은행 (Woori Bank)
  CITIBANK = 'CITIBANK', // 한국씨티은행 (Citibank Korea)
  KEB_HANA = 'KEB_HANA', // KEB하나은행 (KEB Hana Bank)
  SC_FIRST = 'SC_FIRST', // SC제일은행 (Standard Chartered Bank Korea)
  
  // Digital Banks
  K_BANK = 'K_BANK', // K뱅크 (K-Bank)
  KAKAO_BANK = 'KAKAO_BANK', // 카카오뱅크 (KakaoBank)
  TOSS_BANK = 'TOSS_BANK', // 토스뱅크 (Toss Bank)
  
  // Regional Banks
  KYONGNAM = 'KYONGNAM', // 경남은행 (Kyongnam Bank)
  GWANGJU = 'GWANGJU', // 광주은행 (Gwangju Bank)
  DAEGU = 'DAEGU', // 대구은행 (Daegu Bank)
  BUSAN = 'BUSAN', // 부산은행 (Busan Bank)
  JEONBUK = 'JEONBUK', // 전북은행 (Jeonbuk Bank)
  JEJU = 'JEJU', // 제주은행 (Jeju Bank)
  
  // Foreign Banks
  DEUTSCHE = 'DEUTSCHE', // 도이치은행 (Deutsche Bank)
  BOA = 'BOA', // BOA은행 (Bank of America)
  ICBC = 'ICBC', // 중국공상은행 (Industrial and Commercial Bank of China)
  HSBC = 'HSBC', // HSBC은행 (HSBC)
  JPMORGAN_CHASE = 'JPMORGAN_CHASE', // 제이피모간페이스은행 (JPMorgan Chase Bank)
  
  // Specialized Banks
  FORESTRY_COOPERATIVE = 'FORESTRY_COOPERATIVE', // 산림조합중앙회 (National Forestry Cooperative Federation)
  MUTUAL_SAVINGS = 'MUTUAL_SAVINGS', // 상호저축은행 (Mutual Savings Bank)
  SAEMAUL = 'SAEMAUL', // 새마을금고중앙회 (Korean Federation of Community Credit Cooperatives)
  SUHYUP = 'SUHYUP', // 수협은행/수협중앙회 (Suhyup Bank / National Federation of Fisheries Cooperatives)
  CREDIT_UNION = 'CREDIT_UNION', // 신협중앙회 (National Credit Union Federation of Korea)
  POST_OFFICE = 'POST_OFFICE', // 우체국 (Post Office)
  SBI_SAVINGS = 'SBI_SAVINGS', // SBI저축은행 (SBI Savings Bank)
  
  // Securities Firms
  KYOBO_SECURITIES = 'KYOBO_SECURITIES', // 교보증권 (Kyobo Securities)
  DAISHIN_SECURITIES = 'DAISHIN_SECURITIES', // 대신증권 (Daishin Securities)
  DONGBU_SECURITIES = 'DONGBU_SECURITIES', // 동부증권 (Dongbu Securities)
  MERITZ_SECURITIES = 'MERITZ_SECURITIES', // 메리츠종합금융증권 (Meritz Financial Group)
  MIRAE_ASSET = 'MIRAE_ASSET', // 미래에셋대우 (Mirae Asset Daewoo)
  BOOKOOK_SECURITIES = 'BOOKOOK_SECURITIES', // 부국증권 (Bookook Securities)
  SAMSUNG_SECURITIES = 'SAMSUNG_SECURITIES', // 삼성증권 (Samsung Securities)
  SHINYOUNG_SECURITIES = 'SHINYOUNG_SECURITIES', // 신영증권 (Shinyoung Securities)
  SHINHAN_INVESTMENT = 'SHINHAN_INVESTMENT', // 신한금융투자 (Shinhan Investment Corp.)
  YUANTA_SECURITIES = 'YUANTA_SECURITIES', // 유안타증권 (Yuanta Securities)
  EUGENE_SECURITIES = 'EUGENE_SECURITIES', // 유진투자증권 (Eugene Investment & Securities)
  EBEST_SECURITIES = 'EBEST_SECURITIES', // 이베스트투자증권 (eBest Investment & Securities)
  CAPE_SECURITIES = 'CAPE_SECURITIES', // 케이프투자증권 (Cape Investment & Securities)
  KIWOOM_SECURITIES = 'KIWOOM_SECURITIES', // 키움증권 (Kiwoom Securities)
  HANA_INVESTMENT = 'HANA_INVESTMENT', // 하나금융투자 (Hana Financial Investment)
  HI_SECURITIES = 'HI_SECURITIES', // 하이투자증권 (Hi Investment & Securities)
  KOREA_INVESTMENT = 'KOREA_INVESTMENT', // 한국투자증권 (Korea Investment & Securities)
  HANWHA_SECURITIES = 'HANWHA_SECURITIES', // 한화투자증권 (Hanwha Investment & Securities)
  HYUNDAI_SECURITIES = 'HYUNDAI_SECURITIES', // 현대차투자증권 (Hyundai Motor Securities)
  KB_SECURITIES = 'KB_SECURITIES', // KB증권 (KB Securities)
  NH_SECURITIES = 'NH_SECURITIES', // NH투자증권 (NH Investment & Securities)
  SK_SECURITIES = 'SK_SECURITIES', // SK증권 (SK Securities)
}

// Helper object for displaying bank names in Korean and English
export const BankLabels: Record<Bank, { ko: string; en: string }> = {
  [Bank.IBK]: { ko: '기업은행', en: 'Industrial Bank of Korea' },
  [Bank.NONGHYUP]: { ko: '농협은행', en: 'Nonghyup Bank' },
  [Bank.NONGHYUP_FEDERATION]: { ko: '농협중앙회', en: 'Nonghyup Federation' },
  [Bank.SHINHAN]: { ko: '신한은행', en: 'Shinhan Bank' },
  [Bank.KDB]: { ko: '산업은행', en: 'Korea Development Bank' },
  [Bank.WOORI]: { ko: '우리은행', en: 'Woori Bank' },
  [Bank.CITIBANK]: { ko: '한국씨티은행', en: 'Citibank Korea' },
  [Bank.KEB_HANA]: { ko: 'KEB하나은행', en: 'KEB Hana Bank' },
  [Bank.SC_FIRST]: { ko: 'SC제일은행', en: 'Standard Chartered Bank Korea' },
  [Bank.K_BANK]: { ko: 'K뱅크', en: 'K-Bank' },
  [Bank.KAKAO_BANK]: { ko: '카카오뱅크', en: 'KakaoBank' },
  [Bank.TOSS_BANK]: { ko: '토스뱅크', en: 'Toss Bank' },
  [Bank.KYONGNAM]: { ko: '경남은행', en: 'Kyongnam Bank' },
  [Bank.GWANGJU]: { ko: '광주은행', en: 'Gwangju Bank' },
  [Bank.DAEGU]: { ko: '대구은행', en: 'Daegu Bank' },
  [Bank.DEUTSCHE]: { ko: '도이치은행', en: 'Deutsche Bank' },
  [Bank.BOA]: { ko: 'BOA은행', en: 'Bank of America' },
  [Bank.BUSAN]: { ko: '부산은행', en: 'Busan Bank' },
  [Bank.FORESTRY_COOPERATIVE]: { ko: '산림조합중앙회', en: 'National Forestry Cooperative Federation' },
  [Bank.MUTUAL_SAVINGS]: { ko: '상호저축은행', en: 'Mutual Savings Bank' },
  [Bank.SAEMAUL]: { ko: '새마을금고중앙회', en: 'Korean Federation of Community Credit Cooperatives' },
  [Bank.SUHYUP]: { ko: '수협은행/수협중앙회', en: 'Suhyup Bank / National Federation of Fisheries Cooperatives' },
  [Bank.CREDIT_UNION]: { ko: '신협중앙회', en: 'National Credit Union Federation of Korea' },
  [Bank.POST_OFFICE]: { ko: '우체국', en: 'Post Office' },
  [Bank.JEONBUK]: { ko: '전북은행', en: 'Jeonbuk Bank' },
  [Bank.JEJU]: { ko: '제주은행', en: 'Jeju Bank' },
  [Bank.ICBC]: { ko: '중국공상은행', en: 'Industrial and Commercial Bank of China' },
  [Bank.HSBC]: { ko: 'HSBC은행', en: 'HSBC' },
  [Bank.JPMORGAN_CHASE]: { ko: '제이피모간페이스은행', en: 'JPMorgan Chase Bank' },
  [Bank.KYOBO_SECURITIES]: { ko: '교보증권', en: 'Kyobo Securities' },
  [Bank.DAISHIN_SECURITIES]: { ko: '대신증권', en: 'Daishin Securities' },
  [Bank.DONGBU_SECURITIES]: { ko: '동부증권', en: 'Dongbu Securities' },
  [Bank.MERITZ_SECURITIES]: { ko: '메리츠종합금융증권', en: 'Meritz Financial Group' },
  [Bank.MIRAE_ASSET]: { ko: '미래에셋대우', en: 'Mirae Asset Daewoo' },
  [Bank.BOOKOOK_SECURITIES]: { ko: '부국증권', en: 'Bookook Securities' },
  [Bank.SAMSUNG_SECURITIES]: { ko: '삼성증권', en: 'Samsung Securities' },
  [Bank.SHINYOUNG_SECURITIES]: { ko: '신영증권', en: 'Shinyoung Securities' },
  [Bank.SHINHAN_INVESTMENT]: { ko: '신한금융투자', en: 'Shinhan Investment Corp.' },
  [Bank.YUANTA_SECURITIES]: { ko: '유안타증권', en: 'Yuanta Securities' },
  [Bank.EUGENE_SECURITIES]: { ko: '유진투자증권', en: 'Eugene Investment & Securities' },
  [Bank.EBEST_SECURITIES]: { ko: '이베스트투자증권', en: 'eBest Investment & Securities' },
  [Bank.CAPE_SECURITIES]: { ko: '케이프투자증권', en: 'Cape Investment & Securities' },
  [Bank.KIWOOM_SECURITIES]: { ko: '키움증권', en: 'Kiwoom Securities' },
  [Bank.HANA_INVESTMENT]: { ko: '하나금융투자', en: 'Hana Financial Investment' },
  [Bank.HI_SECURITIES]: { ko: '하이투자증권', en: 'Hi Investment & Securities' },
  [Bank.KOREA_INVESTMENT]: { ko: '한국투자증권', en: 'Korea Investment & Securities' },
  [Bank.HANWHA_SECURITIES]: { ko: '한화투자증권', en: 'Hanwha Investment & Securities' },
  [Bank.HYUNDAI_SECURITIES]: { ko: '현대차투자증권', en: 'Hyundai Motor Securities' },
  [Bank.KB_SECURITIES]: { ko: 'KB증권', en: 'KB Securities' },
  [Bank.NH_SECURITIES]: { ko: 'NH투자증권', en: 'NH Investment & Securities' },
  [Bank.SBI_SAVINGS]: { ko: 'SBI저축은행', en: 'SBI Savings Bank' },
  [Bank.SK_SECURITIES]: { ko: 'SK증권', en: 'SK Securities' },
}

// Helper function to get bank options for dropdowns/selects
export const getBankOptions = () => {
  return Object.values(Bank).map(bank => ({
    value: bank,
    label: `${BankLabels[bank].ko} (${BankLabels[bank].en})`,
    labelKo: BankLabels[bank].ko,
    labelEn: BankLabels[bank].en,
  }))
}