'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { getCurrentUserWithRole } from '@/utils/auth/server-roles'
import { sendInvitationEmail } from '@/utils/email/custom-email'

export interface InviteUserState {
  error: string | null
  message: string | null
}

export async function inviteUser(
  prevState: InviteUserState,
  formData: FormData
): Promise<InviteUserState> {
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()

  try {
    // Check if current user is admin
    const currentUser = await getCurrentUserWithRole()
    if (!currentUser || !currentUser.admin_role) {
      return { error: '권한이 없습니다. 관리자만 사용자를 초대할 수 있습니다.', message: null }
    }

    const email = formData.get('email') as string
    const role = formData.get('role') as string || 'user'

    // Validate input
    if (!email) {
      return { error: '이메일 주소는 필수입니다.', message: null }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { error: '유효한 이메일 주소를 입력해주세요.', message: null }
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return { error: '이미 가입된 이메일 주소입니다.', message: null }
    }

    const redirectTo = `${
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }/auth/accept-invite`

    // Generate invitation link using admin client
    const { data, error: linkError } = await adminSupabase.auth.admin.generateLink({
      type: 'invite',
      email: email,
      options: {
        redirectTo: redirectTo,
        data: {
          invited_by: currentUser.id,
          invited_role: role,
          invited_at: new Date().toISOString()
        }
      }
    })

    if (linkError) {
      console.error('Invitation link generation error:', linkError.message)
      return { error: '초대 링크 생성에 실패했습니다.', message: null }
    }

    if (data.properties?.action_link) {
      // Send custom invitation email
      const emailSent = await sendInvitationEmail(
        email, 
        data.properties.action_link,
        currentUser.email // inviter name
      )

      if (!emailSent) {
        return { error: '초대 이메일 발송에 실패했습니다.', message: null }
      }

      // Store invitation record in database (optional)
      const { error: inviteError } = await supabase
        .from('user_invitations')
        .insert({
          email: email,
          invited_by: currentUser.id,
          role: role,
          status: 'pending',
          invited_at: new Date().toISOString()
        })

      if (inviteError) {
        console.error('Failed to store invitation record:', inviteError.message)
        // Don't fail the operation if storing the record fails
      }

      return {
        error: null,
        message: `${email}로 초대 이메일이 발송되었습니다.`,
      }
    }

    return { error: '초대 링크 생성에 실패했습니다.', message: null }
  } catch (err: unknown) {
    console.error('Invite user error:', err)
    return { error: 'Internal Server Error', message: null }
  }
}

export async function resendInvitation(
  email: string,
  inviterName?: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient()

  try {
    // Check if current user is admin
    const currentUser = await getCurrentUserWithRole()
    if (!currentUser || !currentUser.admin_role) {
      return { success: false, message: '권한이 없습니다.' }
    }

    const redirectTo = `${
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }/auth/accept-invite`

    // Generate new invitation link
    const { data, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'invite',
      email: email,
      options: {
        redirectTo: redirectTo
      }
    })

    if (linkError || !data.properties?.action_link) {
      return { success: false, message: '초대 링크 생성에 실패했습니다.' }
    }

    // Send custom invitation email
    const emailSent = await sendInvitationEmail(
      email, 
      data.properties.action_link,
      inviterName || currentUser.email
    )

    if (!emailSent) {
      return { success: false, message: '이메일 발송에 실패했습니다.' }
    }

    // Update invitation record
    await supabase
      .from('user_invitations')
      .update({ 
        status: 'resent',
        resent_at: new Date().toISOString()
      })
      .eq('email', email)

    return { success: true, message: '초대 이메일이 다시 발송되었습니다.' }
  } catch (error) {
    console.error('Resend invitation error:', error)
    return { success: false, message: 'Internal Server Error' }
  }
}
