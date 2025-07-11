import { createClient } from '@/utils/supabase/client'

export interface OtpState {
  error: string | null
  message: string | null
}

// Helper function to validate and format Korean phone numbers
function formatKoreanPhoneNumber(phone: string): string | null {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's a valid Korean mobile number
  if (cleanPhone.length === 11 && cleanPhone.startsWith('010')) {
    // Format: 01012345678 -> +821012345678
    return `+82${cleanPhone.substring(1)}`;
  } else if (cleanPhone.length === 10 && cleanPhone.startsWith('10')) {
    // Format: 1012345678 -> +821012345678
    return `+82${cleanPhone}`;
  }
  
  return null;
}

export async function sendOtp(phone: string): Promise<OtpState> {
  try {
    if (!phone) {
      return {
        error: 'Phone number is required.',
        message: null,
      }
    }

    // Validate and format the phone number
    const formattedPhone = formatKoreanPhoneNumber(phone);
    
    if (!formattedPhone) {
      return {
        error: 'Please enter a valid Korean mobile number (010-XXXX-XXXX format).',
        message: null,
      }
    }


    const supabase = createClient()

    // Check if we should use real SMS (set environment variable ENABLE_REAL_SMS=true)
    const useRealSMS = process.env.NEXT_PUBLIC_ENABLE_REAL_SMS === 'true';
    
    if (!useRealSMS) {
      // Mock implementation for development/testing
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem(`otp_${formattedPhone}`, mockOtp);
      console.debug('Mock OTP generated:', mockOtp); // For testing only
      
      return {
        error: null,
        message: 'Verification code sent successfully. (Check console for mock OTP)',
      }
    }

    // Use real Supabase SMS service
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    if (error) {
      console.error("Supabase send OTP error:", error.message);
      
      // Provide specific error messages based on the error type
      if (error.message.includes('Invalid From Number')) {
        return {
          error: 'SMS service configuration error: Invalid sender number. Please check Twilio settings.',
          message: null,
        }
      } else if (error.message.includes('Account not configured')) {
        return {
          error: 'SMS service not configured. Please set up Twilio in Supabase dashboard.',
          message: null,
        }
      } else {
        return {
          error: `SMS service error: ${error.message}`,
          message: null,
        }
      }
    }

    return {
      error: null,
      message: 'Verification code sent successfully.',
    }
  } catch (err: unknown) {
    console.error("Send OTP error:", err);
    return {
      error: 'Unable to send verification code. Please try again later.',
      message: null,
    }
  }
}

export async function verifyOtp(phone: string, token: string): Promise<OtpState> {
  try {
    if (!phone || !token) {
      return {
        error: 'Phone number and verification code are required.',
        message: null,
      }
    }

    // Validate and format the phone number
    const formattedPhone = formatKoreanPhoneNumber(phone);
    
    if (!formattedPhone) {
      return {
        error: 'Please enter a valid Korean mobile number.',
        message: null,
      }
    }

    const useRealSMS = process.env.NEXT_PUBLIC_ENABLE_REAL_SMS === 'true';

    if (!useRealSMS) {
      // Mock verification for development/testing
      const storedOtp = localStorage.getItem(`otp_${formattedPhone}`);
      if (storedOtp === token) {
        localStorage.removeItem(`otp_${formattedPhone}`); // Clean up
        return {
          error: null,
          message: 'Phone number verified successfully.',
        }
      } else {
        return {
          error: 'Verification code is incorrect or expired.',
          message: null,
        }
      }
    }

    // Use real Supabase verification
    const supabase = createClient()

    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: token,
      type: 'sms',
    });

    if (error) {
      console.error("Supabase verify OTP error:", error.message);
      return {
        error: 'Verification code is incorrect or expired.',
        message: null,
      }
    }

    return {
      error: null,
      message: 'Phone number verified successfully.',
    }
  } catch (err: unknown) {
    console.error("Verify OTP error:", err);
    return {
      error: 'Unable to verify code. Please try again.',
      message: null,
    }
  }
}
