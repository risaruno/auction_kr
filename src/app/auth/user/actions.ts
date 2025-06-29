'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface UpdateProfileState {
  error: string | null
  message: string | null
}

export interface ChangePasswordState {
  error: string | null
  message: string | null
}

export async function updateProfile(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const supabase = await createClient()

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('User auth error:', userError)
      return {
        error: '사용자 인증에 실패했습니다.',
        message: null
      }
    }

    // Extract form data
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const addrDetail = formData.get('addrDetail') as string
    const bank = formData.get('bank') as string
    const accountNumber = formData.get('accountNumber') as string

    // Validate required fields
    if (!fullName || !phone) {
      return {
        error: '이름과 전화번호는 필수 입력 사항입니다.',
        message: null
      }
    }

    // Update profile in database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone,
        address: address,
        addr_detail: addrDetail,
        bank: bank,
        account_number: accountNumber,
        edited_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return {
        error: '프로필 업데이트에 실패했습니다.',
        message: null
      }
    }

    console.log('Profile updated successfully for user:', user.id)
    
    // Revalidate the page to show updated data
    revalidatePath('/auth/user/info')

    return {
      error: null,
      message: '프로필이 성공적으로 업데이트되었습니다.'
    }

  } catch (error) {
    console.error('Unexpected error updating profile:', error)
    return {
      error: '프로필 업데이트 중 오류가 발생했습니다.',
      message: null
    }
  }
}

export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const supabase = await createClient()

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('User auth error:', userError)
      return {
        error: '사용자 인증에 실패했습니다.',
        message: null
      }
    }

    // Extract form data
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return {
        error: '모든 필드를 입력해주세요.',
        message: null
      }
    }

    // Validate new password matches confirmation
    if (newPassword !== confirmPassword) {
      return {
        error: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.',
        message: null
      }
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return {
        error: '새 비밀번호는 최소 8자 이상이어야 합니다.',
        message: null
      }
    }

    // First verify current password by attempting to sign in with it
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email || '',
      password: currentPassword
    })

    if (signInError) {
      return {
        error: '현재 비밀번호가 올바르지 않습니다.',
        message: null
      }
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return {
        error: '비밀번호 변경에 실패했습니다.',
        message: null
      }
    }

    console.log('Password updated successfully for user:', user.id)

    return {
      error: null,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    }

  } catch (error) {
    console.error('Unexpected error changing password:', error)
    return {
      error: '비밀번호 변경 중 오류가 발생했습니다.',
      message: null
    }
  }
}

export async function fetchUserApplications() {
  const supabase = await createClient()

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('User auth error:', userError)
      return {
        success: false,
        data: [],
        error: '사용자 인증에 실패했습니다.'
      }
    }

    // Fetch user's bidding applications
    const { data: applications, error: applicationsError } = await supabase
      .from('bidding_applications')
      .select(`
        *,
        experts (
          name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (applicationsError) {
      console.error('Applications fetch error:', applicationsError)
      return {
        success: false,
        data: [],
        error: '신청 내역을 불러오는데 실패했습니다.'
      }
    }

    console.log('Fetched applications for user:', user.id, 'Count:', applications?.length || 0)

    return {
      success: true,
      data: applications || [],
      error: null
    }

  } catch (error) {
    console.error('Unexpected error fetching applications:', error)
    return {
      success: false,
      data: [],
      error: '신청 내역을 불러오는 중 오류가 발생했습니다.'
    }
  }
}

export async function fetchUserProfile() {
  const supabase = await createClient()

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('User auth error:', userError)
      return {
        success: false,
        data: null,
        error: '사용자 인증에 실패했습니다.'
      }
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return {
        success: false,
        data: null,
        error: '프로필 정보를 불러오는데 실패했습니다.'
      }
    }

    console.log('Fetched profile for user:', user.id)

    return {
      success: true,
      data: profile,
      error: null
    }

  } catch (error) {
    console.error('Unexpected error fetching profile:', error)
    return {
      success: false,
      data: null,
      error: '프로필 정보를 불러오는 중 오류가 발생했습니다.'
    }
  }
}
