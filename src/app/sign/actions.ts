'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server' // Assuming this is your server client path

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

// The signup function can be updated similarly if needed.
export async function signup(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // ... implementation for signup
  return { error: null, message: 'Signup successful!' }
}
