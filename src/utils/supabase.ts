import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 1. Add a check to ensure environment variables are loaded.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key. Check your .env.local file.')
}

// This is the public client, safe for the browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey)


// --- Admin Client Setup ---
// This part should only be imported in server-side files (API routes)

let supabaseAdmin: any = null;

// 2. Check if we are in a server environment before creating the admin client
if (typeof window === 'undefined') {
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseServiceRoleKey) {
        throw new Error('Missing Supabase Service Role Key. Check your .env.local file.')
    }
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
}

export { supabaseAdmin }