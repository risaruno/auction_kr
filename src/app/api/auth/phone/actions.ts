'use server'

import { createClient } from '@/utils/supabase/server'

export interface PhoneOtpState {
  success: boolean
  error: string | null
  message: string | null
  step: 'initial' | 'otp_sent' | 'verified'
}

export async function sendPhoneOtp(phoneNumber: string): Promise<PhoneOtpState> {
  try {
    // First check if phone number is available
    const availabilityCheck = await checkPhoneAvailability(phoneNumber)
    
    if (!availabilityCheck.available) {
      return {
        success: false,
        error: availabilityCheck.error,
        message: null,
        step: 'initial'
      }
    }

    // Validate phone number format (Korean format)
    const phoneRegex = /^010-?\d{4}-?\d{4}$/
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      return {
        success: false,
        error: '올바른 휴대폰 번호를 입력해주세요. (예: 010-1234-5678)',
        message: null,
        step: 'initial'
      }
    }
    
    const formattedPhone = phoneNumber.replace(/^010/, '+8210').replace(/-/g, '')

    // Check if we should use real SMS (set environment variable ENABLE_REAL_SMS=true)
    const useRealSMS = process.env.NEXT_PUBLIC_ENABLE_REAL_SMS === 'true';
    
    if (!useRealSMS) {      
      return {
        success: true,
        error: null,
        message: '인증번호가 발송되었습니다. [Debug Mode] 123456 입력해주세요.',
        step: 'otp_sent'
      }
    }
    
    const supabase = await createClient()

    // Format phone number to international format (+82)

    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    })

    if (error) {
      console.error('Phone OTP error:', error)
      return {
        success: false,
        error: error.message || '인증번호 발송에 실패했습니다.',
        message: null,
        step: 'initial'
      }
    }

    return {
      success: true,
      error: null,
      message: '인증번호가 발송되었습니다. SMS를 확인해주세요.',
      step: 'otp_sent'
    }
  } catch (error) {
    console.error('Unexpected error sending phone OTP:', error)
    return {
      success: false,
      error: '예상치 못한 오류가 발생했습니다.',
      message: null,
      step: 'initial'
    }
  }
}

export async function verifyPhoneOtp(phoneNumber: string, otp: string): Promise<PhoneOtpState> {
  try {
    // Format phone number to international format (+82)
    const formattedPhone = phoneNumber.replace(/^010/, '+8210').replace(/-/g, '')

    const useRealSMS = process.env.NEXT_PUBLIC_ENABLE_REAL_SMS === 'true';
    
    if (!useRealSMS) {
      // Debug mode: accept 123456 as valid OTP
      if ('123456' === otp) {
        return {
          success: true,
          error: null,
          message: '휴대폰 인증이 완료되었습니다.',
          step: 'verified'
        }
      } else {
        return {
          success: false,
          error: '인증번호가 올바르지 않습니다. [Debug Mode] 123456을 입력해주세요.',
          message: null,
          step: 'otp_sent'
        }
      }
    }
    
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: 'sms'
    })

    if (error) {
      console.error('Phone OTP verification error:', error)
      return {
        success: false,
        error: error.message || '인증번호가 올바르지 않습니다.',
        message: null,
        step: 'otp_sent'
      }
    }

    // Sign out immediately after verification since we only want to verify the phone
    await supabase.auth.signOut()

    return {
      success: true,
      error: null,
      message: '휴대폰 인증이 완료되었습니다.',
      step: 'verified'
    }
  } catch (error) {
    console.error('Unexpected error verifying phone OTP:', error)
    return {
      success: false,
      error: '예상치 못한 오류가 발생했습니다.',
      message: null,
      step: 'otp_sent'
    }
  }
}

export interface PhoneAvailabilityState {
  available: boolean
  error: string | null
  message: string | null
}

export async function checkPhoneAvailability(phoneNumber: string): Promise<PhoneAvailabilityState> {
  try {
    // Validate phone number format (Korean format)
    const phoneRegex = /^010-?\d{4}-?\d{4}$/
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      return {
        available: false,
        error: '올바른 휴대폰 번호를 입력해주세요. (예: 010-1234-5678)',
        message: null
      }
    }

    const supabase = await createClient()

    // Check if phone number already exists in profiles table
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, phone')
      .eq('phone', phoneNumber)
      .maybeSingle()

    if (profileError) {
      console.error('Phone availability check error:', profileError)
      return {
        available: false,
        error: '휴대폰 번호 확인 중 오류가 발생했습니다.',
        message: null
      }
    }

    if (existingProfile) {
      return {
        available: false,
        error: '이미 사용 중인 휴대폰 번호입니다.',
        message: null
      }
    }

    return {
      available: true,
      error: null,
      message: '사용 가능한 휴대폰 번호입니다.'
    }
  } catch (error) {
    console.error('Unexpected error checking phone availability:', error)
    return {
      available: false,
      error: '휴대폰 번호 확인 중 오류가 발생했습니다.',
      message: null
    }
  }
}
