// API Types for consistent API responses and requests
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// User Types
export interface User {
  id: string
  name: string
  email: string
  phone: string
  signupDate: string
  status: 'Active' | 'Suspended' | 'Pending'
  points: number
}

export interface UserUpdateRequest {
  userId: string
  status?: 'Active' | 'Suspended' | 'Pending'
  points?: number
}

// Expert Types
export interface Expert {
  id: string
  name: string
  location: string;
  description?: string
  bio?: string
  office_address?: string
  services: string[]
  rating?: number
  experience_years?: number
  photo_url?: string
  is_active?: boolean
  user_id?: string
  created_at: string
  edited_at: string
}

export interface ExpertCreateRequest {
  name: string
  location: string
  description?: string
  bio?: string
  office_address?: string
  services: string[]
  photo_url?: string
  is_active?: boolean
  user_id?: string
}

export interface ExpertUpdateRequest extends Partial<ExpertCreateRequest> {
  id: string
}

// FAQ Types
export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  order?: number
  is_published?: boolean
  created_at: string
  edited_at: string
}

export interface FAQCreateRequest {
  question: string
  answer: string
  category: string
  order?: number
  is_published?: boolean
}

export interface FAQUpdateRequest extends Partial<FAQCreateRequest> {
  id: string
}

// Bidding Application Types
export interface BiddingApplication {
  id: string
  user_id: string
  case_number: string
  court_name: string
  bid_date: string
  bid_amount: number
  application_type: 'personal' | 'company' | 'group'
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed'
  
  // Personal application fields
  bidder_name?: string
  resident_id1?: string
  resident_id2?: string
  phone_number?: string
  zip_no?: string
  road_addr?: string
  addr_detail?: string
  
  // Company application fields
  company_name?: string
  business_number?: string
  representative_name?: string
  company_phone?: string
  company_zip_no?: string
  company_road_addr?: string
  company_addr_detail?: string
  
  // Group application fields
  group_representative_name?: string
  group_representative_id1?: string
  group_representative_id2?: string
  group_member_count?: number
  group_members?: string
  
  // Common fields
  phone_verified: boolean
  has_signature: boolean
  bank?: string
  account_number?: string
  expert_id?: string;
  payment_status?: 'pending' | 'paid' | 'failed'
  deposit_status?: 'pending' | 'confirmed' | 'refunded'
  result_notes?: string
  result?: string
  created_at: string
  updated_at: string
    // Relations (populated by joins)
  user?: {
    full_name: string
    email: string
    phone?: string
  };
  expert?: {
    name: string
    location?: string
    description?: string
  }
}

export interface BiddingApplicationCreateRequest {
  case_number: string
  court_name: string
  bid_date: string
  bid_amount: number
  application_type: 'personal' | 'company' | 'group'
  
  // Conditional fields based on application type
  [key: string]: any
}

export interface BiddingApplicationUpdateRequest {
  id: string
  status?: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed'
  assigned_expert_id?: string
  payment_status?: 'pending' | 'paid' | 'failed'
  deposit_status?: 'pending' | 'confirmed' | 'refunded'
  result_notes?: string
  result?: string
  [key: string]: any
}

// Inquiry Types
export interface Inquiry {
  id: string
  user_id: string
  title: string
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  category: string
  created_at: string
  edited_at: string
}

export interface InquiryMessage {
  id: string
  inquiry_id: string
  sender_id: string
  sender_type: 'user' | 'admin'
  message: string
  attachments?: string[]
  created_at: string
}

export interface InquiryCreateRequest {
  title: string
  message: string
  category: string
  priority?: 'low' | 'medium' | 'high'
}

// Court Auction Types
export interface CourtAuctionRequest {
  cortOfcCd: string
  csNo: string
}

export interface CourtAuctionData {
  courtName: string
  caseNumber: string
  printCaseNumber: string
  evaluationAmt: number
  lowestBidAmt: number
  depositAmt: number
  bidDate: string
  picFile?: string
}

// Common API Request Types
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface SearchParams extends PaginationParams {
  q?: string
  filters?: Record<string, any>
  // Allow additional dynamic properties
  [key: string]: any
}
