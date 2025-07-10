'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { getCurrentUserWithRole } from '@/utils/auth/server-roles'
import { getRedirectPath } from '@/utils/auth/roles-client'
import { sendCustomPasswordResetEmail, sendConfirmationEmail } from '@/utils/email/custom-email'

// This interface defines the shape of the state our form will manage.
export interface FormState {
  error: string | null
  message: string | null
}

export async function login(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  // 1. Get email, password, and our new redirectTo from the form data
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string | null // MODIFIKASI: Ambil redirectTo dari form

  if (!email || !password) {
    return { error: 'Email and password are required.', message: null }
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: 'Please enter a valid email address.', message: null }
  }

  // Password validation: 8-16 characters
  if (password.length < 8 || password.length > 16) {
    return {
      error: 'Password must be between 8 and 16 characters long.',
      message: null,
    }
  }

  // 2. Call Supabase sign-in
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // 3. Instead of redirecting on error, return the error message.
  if (error) {
    console.error('Login Error:', error.message)
    // Berikan pesan error yang lebih relevan
    return { error: '이메일 또는 비밀번호가 일치하지 않습니다.', message: null }
  }

  // 4. On success, get user role and redirect accordingly
  revalidatePath('/auth/user/history', 'layout')

  // Get the user with their role to determine redirect path
  const userWithRole = await getCurrentUserWithRole()
  
  // If redirectTo is provided, use it; otherwise use role-based redirect
  if (redirectTo) {
    redirect(redirectTo)
  } else {
    const defaultPath = userWithRole ? getRedirectPath(userWithRole.admin_role) : '/'
    redirect(defaultPath)
  }
}

// ==================================================================
// Fungsi-fungsi di bawah ini tidak perlu diubah untuk alur login
// ==================================================================

export async function signup(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const adminSupabase = await createAdminClient()

  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // 1. Validate all required fields
    if (!name || !email || !password) {
      return { error: 'Name, email, and password are required.', message: null }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { error: 'Please enter a valid email address.', message: null }
    }

    // Password validation: 8-16 characters
    if (password.length < 8 || password.length > 16) {
      return {
        error: 'Password must be between 8 and 16 characters long.',
        message: null,
      }
    }

    // 2. Use Supabase's signUp method with custom email confirmation
    const confirmRedirectUrl = `${
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }/auth/confirm`

    // Option 1: Supabase built-in email confirmation (comment out for custom)
    /*
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: confirmRedirectUrl,
      },
    })
    */

    // Option 2: Custom email confirmation (enabled)
    const { data, error } = await adminSupabase.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: {
        full_name: name,
      },
      email_confirm: false, // We'll send custom confirmation email
    })

    if (error) {
      console.error('Supabase sign-up error:', error.message)
      return { error: error.message, message: null }
    }

    // 3. Generate custom email confirmation link and send custom email
    if (data.user) {
      try {
        // Generate confirmation link
        const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
          type: 'signup',
          email: email,
          password: password,
          options: {
            redirectTo: confirmRedirectUrl
          }
        })

        if (linkError) {
          console.error('Link generation error:', linkError.message)
        } else if (linkData.properties?.action_link) {
          // Send custom confirmation email
          await sendConfirmationEmail(email, linkData.properties.action_link)
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError)
        // Don't fail the signup if email sending fails
      }

      return {
        error: null,
        message:
          '회원가입이 완료되었습니다! 이메일을 확인하여 계정을 활성화해주세요.',
      }
    }

    return {
      error: 'An unexpected error occurred during sign-up.',
      message: null,
    }
  } catch (err: unknown) {
    console.error('Sign-up error:', err)
    return { error: 'Internal Server Error', message: null }
  }
}

export async function findPassword(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const adminSupabase = await createAdminClient()

  try {
    const email = formData.get('email') as string

    // Validate input
    if (!email) {
      return { error: '이메일 필수로 입력해주세요.', message: null }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { error: '유효한 이메일 주소를 입력해주세요.', message: null }
    }

    // Simplified approach: Skip user existence check for now to focus on the main issue
    // The original error suggests there's a Supabase configuration problem
    // Let's just try to generate the reset token and see what happens
    console.log(`Attempting password reset for email: ${email}`)

    // Option 2: Custom email service (enabled for better control)
    let error = null
    const redirectTo = `${
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }/sign/update-password`

    console.log('Environment check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasResendKey: !!process.env.RESEND_API_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
      redirectTo
    })

    // Generate a password reset token using admin client
    const { data, error: tokenError } = await adminSupabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: redirectTo
      }
    })

    if (tokenError) {
      console.error('Token generation error:', tokenError.message)
      console.error('Token generation error details:', tokenError)
      error = tokenError
    } else if (data.properties?.action_link) {
      console.log('Reset token generated successfully, attempting to send email...')
      // Send custom email using your preferred service
      const emailSent = await sendCustomPasswordResetEmail(email, data.properties.action_link)
      console.log('Email sending result:', emailSent)
      if (!emailSent) {
        console.error('Failed to send email via custom email service')
        error = { message: 'Failed to send email' }
      } else {
        console.log('Password reset email sent successfully to:', email)
      }
    } else {
      console.error('No action link generated in reset token response')
      error = { message: 'Failed to generate reset link' }
    }

    if (error) {
      // For security, do not reveal if the user does or does not exist.
      // Log the actual error on the server, but send a generic success message.
      console.error('Password reset error:', error.message)
    }

    // Always return a success message to prevent user enumeration attacks.
    return {
      error: null,
      message:
        '해당 이메일로 비밀번호 재설정 링크가 전송되었습니다. 이메일을 확인해주세요.',
    }
  } catch (err: unknown) {
    console.error('Find password error:', err)
    return { error: 'Internal Server Error', message: null }
  }
}

export async function updatePassword(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const adminSupabase = await createAdminClient()
  try {
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Validate input
    if (!newPassword || !confirmPassword) {
      return {
        error: '새 비밀번호와 확인 비밀번호가 필요합니다.',
        message: null,
      }
    }

    if (newPassword !== confirmPassword) {
      return { error: '비밀번호가 일치하지 않습니다.', message: null }
    }

    // Password validation: 8-16 characters
    if (newPassword.length < 8 || newPassword.length > 16) {
      return {
        error: '비밀번호는 8자에서 16자 사이여야 합니다.',
        message: null,
      }
    }

    // Check if user is authenticated (should be via password reset link)
    const {
      data: { user },
      error: userError,
    } = await adminSupabase.auth.getUser()

    if (userError || !user) {
      return {
        error:
          '인증이 필요합니다. 이메일의 비밀번호 재설정 링크를 사용해주세요.',
        message: null,
      }
    }

    // Update the user's password (user must be authenticated via email link)
    const { error: updateError } = await adminSupabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      console.error('Error updating password:', updateError.message)
      return {
        error: '비밀번호 업데이트에 실패했습니다. 다시 시도해주세요.',
        message: null,
      }
    }

    // Return success message instead of redirecting immediately
    return {
      error: null,
      message:
        '비밀번호가 성공적으로 업데이트되었습니다! 이제 새 비밀번호로 로그인할 수 있습니다.',
    }
  } catch (err: unknown) {
    console.error('Update password error:', err)
    return { error: 'Internal Server Error', message: null }
  }
}

export async function logout(): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Logout error:', error.message)
    throw new Error('로그아웃에 실패했습니다.')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}