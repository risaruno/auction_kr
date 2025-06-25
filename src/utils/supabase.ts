// In lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Keep this secret!

// Client for frontend use
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for backend use (with full access)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)