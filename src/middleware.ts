import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Protect admin management pages
    '/auth/manage/:path*',
    
    // Protect user dashboard and profile pages
    '/auth/user/:path*',
    
    // Protect bid application pages
    '/apply-bid/:path*',
    
    // Protect checkout pages
    '/checkout/:path*',
    
    // Protect auth confirmation pages
    '/auth/confirm/:path*',
  ],
}
