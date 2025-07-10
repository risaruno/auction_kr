import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Only allow this in development or with a secret key
  const secret = request.nextUrl.searchParams.get('secret')
  const expectedSecret = process.env.DEBUG_SECRET || 'debug123'
  
  if (secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    supabase: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
    },
    email: {
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasSendGridKey: !!process.env.SENDGRID_API_KEY,
      hasMailgunKey: !!process.env.MAILGUN_API_KEY,
      hasMailgunDomain: !!process.env.MAILGUN_DOMAIN,
    },
    site: {
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      domain: process.env.NEXT_PUBLIC_DOMAIN,
    }
  })
}
