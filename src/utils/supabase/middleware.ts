import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Get the current user and session
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  // Also check session to be more reliable
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession()

  console.log('Middleware check - User:', user?.email || 'no user', 'Path:', pathname)

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/about',
    '/contact',
    '/faq',
    '/experts',
    '/policy',
    '/area',
    '/info'
  ]

  // Auth routes that should redirect logged-in users
  const authRoutes = [
    '/sign/in',
    '/sign/up',
    '/sign/find-password'
  ]

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // Use session for more reliable authentication check
  const isAuthenticated = !!(session?.user && user)

  // If user is logged in and trying to access auth routes, redirect to user dashboard
  if (isAuthenticated && isAuthRoute) {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // If no user and trying to access protected route, redirect to login
  if (!isAuthenticated && !isPublicRoute && !isAuthRoute) {
    url.pathname = '/sign/in'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // If user exists, check role-based access for admin routes
  if (isAuthenticated && pathname.startsWith('/auth/manage')) {
    try {
      // Get user profile with role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('admin_role')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        url.pathname = '/auth/user/history'
        return NextResponse.redirect(url)
      }

      // Check if user has admin role
      const adminRoles = ['super_admin', 'content_manager', 'customer_support']
      if (!profile?.admin_role || !adminRoles.includes(profile.admin_role)) {
        // User doesn't have admin role, redirect to user dashboard
        url.pathname = '/auth/user/history'
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('Error in role check:', error)
      url.pathname = '/auth/user/history'
      return NextResponse.redirect(url)
    }
  }

  // If user exists and trying to access user routes, ensure they're not trying to access admin routes
  if (isAuthenticated && pathname.startsWith('/auth/user')) {
    // This is fine, regular users can access user routes
  }

  return supabaseResponse
}
