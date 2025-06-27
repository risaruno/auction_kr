import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}
export const config = {
  matcher: [
    // Protect user-related pages
    '/auth/:path*',
    '/apply-bid/:path*',
    '/checkout/:path*',

    // Protect admin-related pages
    '/auth/manage/:path*',

    // Protect user-specific pages
    '/auth/user/:path*',

    // Protect apply-bid pages
    '/apply-bid/:path*',
  ],
}
