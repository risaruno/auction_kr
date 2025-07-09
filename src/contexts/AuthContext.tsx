'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { type AdminRole, type UserWithRole } from '@/utils/auth/roles-client'
import { Session } from "@supabase/supabase-js";
import { useRouter } from 'next/navigation';

// ===== SESSION CONFIGURATION =====
// Configure session management settings here
const SESSION_CONFIG = {
  // How often to check for session expiration (in milliseconds)
  CHECK_INTERVAL: 60000, // 1 minute
  
  // Warning time before session expires (in milliseconds)
  WARNING_TIME: 300000, // 5 minutes
  
  // Custom session timeout in minutes (set to null to use Supabase default)
  // If set, this will override Supabase's expiration time
  CUSTOM_SESSION_TIMEOUT_MINUTES: null as number | null, // e.g., 60 for 1 hour, 480 for 8 hours
  
  // Activity tracking settings
  ACTIVITY_REFRESH_ENABLED: true, // Enable automatic session refresh on user activity
  ACTIVITY_REFRESH_THRESHOLD: 300000, // 5 minutes - minimum time before allowing another refresh
  INACTIVITY_WARNING_TIME: 600000, // 10 minutes - warn user after this period of inactivity
  
  // Events that count as user activity
  ACTIVITY_EVENTS: [
    'mousedown', 'mousemove', 'keypress', 'scroll', 
    'touchstart', 'click', 'focus'
  ],
  
  // Whether to show console logs for session management
  DEBUG_LOGS: true,
}

// Helper function to convert minutes to milliseconds
const minutesToMs = (minutes: number) => minutes * 60 * 1000

interface AuthContextType {
  user: UserWithRole | null
  loading: boolean
  isInitialized: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  session: Session | null
  sessionExpiresAt: number | null
  isSessionExpired: boolean
  isSessionExpiringSoon: boolean // warns when session is about to expire
  minutesUntilExpiry: number | null // shows remaining time
  lastActivityTime: number | null // tracks last user activity
  refreshSession: () => Promise<void> // manually refresh session
  isInactive: boolean // true if user has been inactive for too long
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null)
  const [lastActivityTime, setLastActivityTime] = useState<number | null>(null)
  const lastRefreshTime = useRef<number>(0)
  const supabase = createClient()
  const router = useRouter()

  // Helper function for debug logging
  const logSession = (message: string, ...args: unknown[]) => {
    if (SESSION_CONFIG.DEBUG_LOGS) {
      console.log(`[AuthContext] ${message}`, ...args)
    }
  }

  // Check if session is expired
  const isSessionExpired = sessionExpiresAt ? Date.now() > sessionExpiresAt : false
  
  // Check if session is expiring soon (within WARNING_TIME)
  const isSessionExpiringSoon = sessionExpiresAt ? 
    (sessionExpiresAt - Date.now()) <= SESSION_CONFIG.WARNING_TIME && 
    (sessionExpiresAt - Date.now()) > 0 : false
  
  // Calculate minutes until expiry
  const minutesUntilExpiry = sessionExpiresAt ? 
    Math.max(0, Math.floor((sessionExpiresAt - Date.now()) / 60000)) : null

  // Check if user has been inactive for too long
  const isInactive = lastActivityTime ? 
    (Date.now() - lastActivityTime) > SESSION_CONFIG.INACTIVITY_WARNING_TIME : false

  // Manual session refresh function
  const refreshSession = useCallback(async () => {
    try {
      logSession('Manually refreshing session...')
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Error refreshing session:', error)
        return
      }

      if (session) {
        setSession(session)
        const expirationTime = SESSION_CONFIG.CUSTOM_SESSION_TIMEOUT_MINUTES 
          ? Date.now() + minutesToMs(SESSION_CONFIG.CUSTOM_SESSION_TIMEOUT_MINUTES)
          : (session.expires_at ? session.expires_at * 1000 : null)
        
        if (expirationTime) {
          setSessionExpiresAt(expirationTime)
          logSession('Session refreshed, new expiry:', new Date(expirationTime).toISOString())
        }
        
        lastRefreshTime.current = Date.now()
      }
    } catch (error) {
      console.error('Error in refreshSession:', error)
    }
  }, [supabase])

  // Activity tracking function
  const trackActivity = useCallback(() => {
    const now = Date.now()
    setLastActivityTime(now)
    
    // Auto-refresh session if enabled and conditions are met
    if (SESSION_CONFIG.ACTIVITY_REFRESH_ENABLED && 
        session && 
        !isSessionExpired && 
        (now - lastRefreshTime.current) > SESSION_CONFIG.ACTIVITY_REFRESH_THRESHOLD) {
      
      logSession('User activity detected, refreshing session...')
      refreshSession()
    }
  }, [session, isSessionExpired, refreshSession])

  // Register activity listeners
  useEffect(() => {
    if (!SESSION_CONFIG.ACTIVITY_REFRESH_ENABLED || typeof window === 'undefined') {
      return
    }

    const events = [...SESSION_CONFIG.ACTIVITY_EVENTS, 'userActivity'] // Add custom event
    
    logSession('Registering activity listeners for events:', events)
    
    events.forEach(event => {
      if (event === 'userActivity') {
        window.addEventListener(event, trackActivity, { passive: true })
      } else {
        document.addEventListener(event, trackActivity, { passive: true })
      }
    })

    return () => {
      events.forEach(event => {
        if (event === 'userActivity') {
          window.removeEventListener(event, trackActivity)
        } else {
          document.removeEventListener(event, trackActivity)
        }
      })
    }
  }, [trackActivity])

  const fetchUserWithRole = useCallback(async (forceRefresh = false) => {
    try {
      logSession('Fetching user with role...', { forceRefresh })
      
      if (!isInitialized || forceRefresh) {
        setLoading(true)
      }
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      logSession('Session check:', { 
        hasSession: !!session, 
        hasUser: !!session?.user, 
        userEmail: session?.user?.email,
        error: sessionError 
      })
      
      if (sessionError || !session?.user) {
        logSession('No valid session found')
        setUser(null)
        setSession(null)
        setSessionExpiresAt(null)
        setLastActivityTime(null)
        return
      }

      const authUser = session.user

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('admin_role, full_name')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        
        if (profileError.code === '42703' || profileError.code === 'PGRST116') {
          console.log('Profile table issue or user profile missing, creating basic profile...')
          
          const { error: createError } = await supabase
            .from('profiles')
            .upsert({
              id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name || '',
              admin_role: 'user'
            })
          
          if (createError) {
            console.error('Error creating profile:', createError)
          }
          
          const userWithRole = {
            id: authUser.id,
            email: authUser.email || '',
            admin_role: 'user' as AdminRole,
            full_name: authUser.user_metadata?.full_name || ''
          }
          logSession('Setting user with default role:', userWithRole)
          setUser(userWithRole)
          setSession(session)
          
          // Set session expiration time
          const expirationTime = SESSION_CONFIG.CUSTOM_SESSION_TIMEOUT_MINUTES 
            ? Date.now() + minutesToMs(SESSION_CONFIG.CUSTOM_SESSION_TIMEOUT_MINUTES)
            : (session.expires_at ? session.expires_at * 1000 : null)
          
          if (expirationTime) {
            setSessionExpiresAt(expirationTime)
            logSession('Session expires at:', new Date(expirationTime).toISOString())
          }
          
          // Initialize activity tracking
          setLastActivityTime(Date.now())
        } else {
          const userWithRole = {
            id: authUser.id,
            email: authUser.email || '',
            admin_role: 'user' as AdminRole,
            full_name: authUser.user_metadata?.full_name || ''
          }
          logSession('Setting user without profile due to error:', userWithRole)
          setUser(userWithRole)
          setSession(session)
          
          // Set session expiration time
          const expirationTime = SESSION_CONFIG.CUSTOM_SESSION_TIMEOUT_MINUTES 
            ? Date.now() + minutesToMs(SESSION_CONFIG.CUSTOM_SESSION_TIMEOUT_MINUTES)
            : (session.expires_at ? session.expires_at * 1000 : null)
          
          if (expirationTime) {
            setSessionExpiresAt(expirationTime)
            logSession('Session expires at:', new Date(expirationTime).toISOString())
          }
          
          // Initialize activity tracking
          setLastActivityTime(Date.now())
        }
      } else {
        const userWithRole = {
          id: authUser.id,
          email: authUser.email || '',
          admin_role: (profile?.admin_role || 'user') as AdminRole,
          full_name: profile?.full_name || authUser.user_metadata?.full_name || ''
        }
        logSession('Setting user with profile:', userWithRole)
        setUser(userWithRole)
        setSession(session)
        
        // Set session expiration time
        const expirationTime = SESSION_CONFIG.CUSTOM_SESSION_TIMEOUT_MINUTES 
          ? Date.now() + minutesToMs(SESSION_CONFIG.CUSTOM_SESSION_TIMEOUT_MINUTES)
          : (session.expires_at ? session.expires_at * 1000 : null)
        
        if (expirationTime) {
          setSessionExpiresAt(expirationTime)
          logSession('Session expires at:', new Date(expirationTime).toISOString())
        }
        
        // Initialize activity tracking
        setLastActivityTime(Date.now())
      }
    } catch (error) {
      console.error('Error fetching user with role:', error)
      setUser(null)
      setSession(null)
      setSessionExpiresAt(null)
      setLastActivityTime(null)
    } finally {
      setLoading(false)
    }
  }, [supabase, isInitialized]) // Only depend on supabase and isInitialized

  const signOut = async () => {
    try {
      setLoading(true)
      logSession('Starting sign out process...')
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Supabase sign out error:', error)
      }
      
      setUser(null)
      setSession(null)
      setSessionExpiresAt(null)
      setLastActivityTime(null)
      
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        
        router.push('/')
      }
    } catch (error) {
      console.error('Error during sign out:', error)
      setUser(null)
      setSession(null)
      setSessionExpiresAt(null)
      setLastActivityTime(null)
      if (typeof window !== 'undefined') {
        router.push('/')
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    await fetchUserWithRole(true) // Force refresh
  }

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible' && isInitialized) {
      logSession('Window became visible, checking auth state silently...')
      
      // Track activity when user returns to tab
      trackActivity()
      
      // Check if session is expired
      if (isSessionExpired) {
        logSession('Session has expired, signing out...')
        setUser(null)
        setSession(null)
        setSessionExpiresAt(null)
        setLastActivityTime(null)
        return
      }
      
      // Check if session still exists in Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session && user) {
          logSession('User session expired while away')
          setUser(null)
          setSession(null)
          setSessionExpiresAt(null)
          setLastActivityTime(null)
        } else if (session && session.expires_at) {
          // Update expiration time if session was refreshed
          const expirationTime = SESSION_CONFIG.CUSTOM_SESSION_TIMEOUT_MINUTES 
            ? Date.now() + minutesToMs(SESSION_CONFIG.CUSTOM_SESSION_TIMEOUT_MINUTES)
            : (session.expires_at * 1000)
          setSessionExpiresAt(expirationTime)
        }
      })
    }
  }, [user, isInitialized, supabase, isSessionExpired, trackActivity])

  // Periodic session expiration check
  useEffect(() => {
    if (!sessionExpiresAt) return

    const checkSessionExpiration = () => {
      if (Date.now() > sessionExpiresAt) {
        logSession('Session expired, signing out automatically...')
        setUser(null)
        setSession(null)
        setSessionExpiresAt(null)
        setLastActivityTime(null)
      }
    }

    // Check every interval specified in config
    const interval = setInterval(checkSessionExpiration, SESSION_CONFIG.CHECK_INTERVAL)
    
    // Also check when sessionExpiresAt changes
    checkSessionExpiration()

    return () => clearInterval(interval)
  }, [sessionExpiresAt])

  useEffect(() => {
    let isMounted = true
    
    // PERUBAHAN 1: Blok setTimeout 8 detik DIHAPUS dari sini.
    // Ini mencegah 'loading' menjadi false secara prematur.

    console.log('AuthContext: Initial setup')
    const initialFetch = async () => {
      if (isMounted) {
        await fetchUserWithRole()
      }
    }
    initialFetch()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return
        if (!isInitialized) return
        
        // PERUBAHAN 2: setTimeout (debounce) 500ms DIHAPUS. 
        // Logika di dalamnya sekarang berjalan instan untuk mencegah delay.
        console.log('Auth state changed:', event, session?.user?.email || 'no user')
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, fetching user with role...')
          await fetchUserWithRole(true)
        } else if (event === 'SIGNED_OUT' || !session) {
          console.log('User signed out, clearing user state')
          setUser(null)
          setSession(null)
          setLoading(false)
          setIsInitialized(true)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('Token refreshed, updating user...')
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('admin_role, full_name')
              .eq('id', session.user.id)
              .single()
            
            if (profile) {
              const userWithRole = {
                id: session.user.id,
                email: session.user.email || '',
                admin_role: (profile?.admin_role || 'user') as AdminRole,
                full_name: profile?.full_name || session.user.user_metadata?.full_name || ''
              }
              setUser(userWithRole)
              setSession(session)
            }
          } else {
            await fetchUserWithRole(true)
          }
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchUserWithRole, isInitialized]) // Remove handleVisibilityChange from dependencies

  // Separate effect for visibility change handler to avoid circular dependencies
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [handleVisibilityChange]) // This effect only depends on handleVisibilityChange

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isInitialized, 
      signOut, 
      refreshUser, 
      session, 
      sessionExpiresAt, 
      isSessionExpired,
      isSessionExpiringSoon,
      minutesUntilExpiry,
      lastActivityTime,
      refreshSession,
      isInactive
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useIsAdmin() {
  const { user } = useAuth()
  const adminRoles: AdminRole[] = ['super_admin', 'admin', 'content_manager', 'customer_support']
  return user?.admin_role ? adminRoles.includes(user.admin_role) : false
}

export function useIsSuperAdmin() {
  const { user } = useAuth()
  return user?.admin_role === 'super_admin'
}

export function useCanManageContent() {
  const { user } = useAuth()
  const contentRoles: AdminRole[] = ['super_admin', 'admin', 'content_manager']
  return user?.admin_role ? contentRoles.includes(user.admin_role) : false
}

export function useCanManageUsers() {
  const { user } = useAuth()
  return user?.admin_role === 'super_admin' || user?.admin_role === 'admin'
}

export function useCanHandleSupport() {
  const { user } = useAuth()
  const supportRoles: AdminRole[] = ['super_admin', 'admin', 'content_manager', 'customer_support']
  return user?.admin_role ? supportRoles.includes(user.admin_role) : false
}

// Custom hook for components to trigger activity tracking
export function useActivityTracker() {
  const { refreshSession, lastActivityTime, isInactive } = useAuth()
  
  // Function components can call this to manually track activity
  const trackActivity = useCallback(() => {
    // This will trigger the activity tracking in the context
    // You can call this in component event handlers if needed
    if (typeof window !== 'undefined') {
      // Dispatch a custom event that the context will pick up
      window.dispatchEvent(new Event('userActivity'))
    }
  }, [])

  // Function to manually refresh session
  const forceRefreshSession = useCallback(() => {
    refreshSession()
  }, [refreshSession])

  return {
    trackActivity,
    forceRefreshSession,
    lastActivityTime,
    isInactive,
    minutesSinceLastActivity: lastActivityTime ? 
      Math.floor((Date.now() - lastActivityTime) / 60000) : null
  }
}