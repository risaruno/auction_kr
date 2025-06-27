'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

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

  // 1. Get email and password from the form data
  const email = formData.get('email') as string
  const password = formData.get('password') as string

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
    return { error: 'Password must be between 8 and 16 characters long.', message: null }
  }

  // 2. Call Supabase sign-in
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // 3. Instead of redirecting on error, return the error message.
  if (error) {
    console.error('Login Error:', error.message)
    return { error: 'Invalid credentials. Please try again.', message: null }
  }

  // 4. On success, revalidate and redirect as before.
  revalidatePath('/', 'layout')
  redirect('/auth/user/history') // Redirect to a protected page on success
}

export async function signup(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

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
      return { error: 'Password must be between 8 and 16 characters long.', message: null }
    }

    // 2. Use Supabase's signUp method
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        // Store the user's full name in the metadata
        data: {
          full_name: name,
        },
        // Set the redirect URL for email confirmation
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm`,
      },
    })

    if (error) {
      console.error('Supabase sign-up error:', error.message)
      return { error: error.message, message: null }
    }

    // 3. Handle the response from Supabase
    if (data.user) {
      // Supabase's default is to require email confirmation.
      // The user object is returned, but the session is null until confirmed.
      return {
        error: null,
        message: 'Sign-up successful! Please check your email to verify your account.',
      }
    }

    return { error: 'An unexpected error occurred during sign-up.', message: null }

  } catch (err: any) {
    console.error('Sign-up error:', err)
    return { error: 'Internal Server Error', message: null }
  }
}

export async function findPassword(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  try {
    const email = formData.get('email') as string

    // Validate input
    if (!email) {
      return { error: 'Email is required.', message: null }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { error: 'Please enter a valid email address.', message: null }
    }

    // This is the page where the user will be redirected to set their new password.
    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sign/update-password`

    // Call Supabase's built-in function to send the password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      // For security, do not reveal if the user does or does not exist.
      // Log the actual error on the server, but send a generic success message.
      console.error('Password reset error:', error.message)
    }

    // Always return a success message to prevent user enumeration attacks.
    return {
      error: null,
      message: 'If an account with this email exists, a password reset link has been sent.',
    }

  } catch (err: any) {
    console.error('Find password error:', err)
    return { error: 'Internal Server Error', message: null }
  }
}

export async function updatePassword(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  try {
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Validate input
    if (!newPassword || !confirmPassword) {
      return { error: 'New password and confirmation are required.', message: null }
    }

    if (newPassword !== confirmPassword) {
      return { error: 'Passwords do not match.', message: null }
    }

    // Password validation: 8-16 characters
    if (newPassword.length < 8 || newPassword.length > 16) {
      return { error: 'Password must be between 8 and 16 characters long.', message: null }
    }

    // Check if user is authenticated (should be via password reset link)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { 
        error: 'Authentication required. Please use the password reset link from your email.', 
        message: null 
      }
    }

    // Update the user's password (user must be authenticated via email link)
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      console.error('Error updating password:', updateError.message)
      return { error: 'Failed to update password. Please try the reset link again.', message: null }
    }

    // Return success message instead of redirecting immediately
    return {
      error: null,
      message: 'Password updated successfully! You can now sign in with your new password.',
    }

  } catch (err: any) {
    console.error('Update password error:', err)
    return { error: 'Internal Server Error', message: null }
  }
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Logout error:', error.message)
    throw new Error('Failed to logout')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
