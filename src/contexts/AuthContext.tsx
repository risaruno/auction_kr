'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { type AdminRole, type UserWithRole } from '@/utils/auth/roles'

interface AuthContextType {
  user: UserWithRole | null
  loading: boolean
  isInitialized: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const supabase = createClient()

  const fetchUserWithRole = async (forceRefresh = false) => {
    try {
      console.log('Fetching user with role...', { forceRefresh })
      
      // Don't set loading to true if we're already initialized and this is not a forced refresh
      if (!isInitialized || forceRefresh) {
        setLoading(true)
      }
      
      // First check if there's a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      console.log('Session check:', { 
        hasSession: !!session, 
        hasUser: !!session?.user, 
        userEmail: session?.user?.email,
        error: sessionError 
      })
      
      if (sessionError || !session?.user) {
        console.log('No valid session found')
        setUser(null)
        return
      }

      const authUser = session.user

      // Fetch user profile with role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('admin_role, full_name')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        
        // If the profiles table doesn't exist or user doesn't have a profile, 
        // try to create one or use default values
        if (profileError.code === '42703' || profileError.code === 'PGRST116') {
          console.log('Profile table issue or user profile missing, creating basic profile...')
          
          // Try to create a basic profile
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
          console.log('Setting user with default role:', userWithRole)
          setUser(userWithRole)
        } else {
          // For other errors, still create a basic user object
          const userWithRole = {
            id: authUser.id,
            email: authUser.email || '',
            admin_role: 'user' as AdminRole,
            full_name: authUser.user_metadata?.full_name || ''
          }
          console.log('Setting user without profile due to error:', userWithRole)
          setUser(userWithRole)
        }
      } else {
        const userWithRole = {
          id: authUser.id,
          email: authUser.email || '',
          admin_role: (profile?.admin_role || 'user') as AdminRole,
          full_name: profile?.full_name || authUser.user_metadata?.full_name || ''
        }
        console.log('Setting user with profile:', userWithRole)
        setUser(userWithRole)
      }
    } catch (error) {
      console.error('Error fetching user with role:', error)
      setUser(null)
    } finally {
      setLoading(false)
      if (!isInitialized) {
        setIsInitialized(true)
      }
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      console.log('Starting sign out process...')
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Supabase sign out error:', error)
      }
      
      // Clear local state immediately
      setUser(null)
      
      // Clear any local storage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        
        // Redirect to home page
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Error during sign out:', error)
      // Even if there's an error, clear the local state
      setUser(null)
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    await fetchUserWithRole(true) // Force refresh
  }

  useEffect(() => {
    let isMounted = true
    let authChangeTimeout: NodeJS.Timeout | null = null
    
    // Set a maximum loading time of 8 seconds
    const loadingTimeout = setTimeout(() => {
      if (isMounted && loading && !isInitialized) {
        console.warn('Auth loading timeout - forcing loading to false')
        setLoading(false)
        setIsInitialized(true)
      }
    }, 8000)

    // Initial fetch
    console.log('AuthContext: Initial setup')
    const initialFetch = async () => {
      if (isMounted) {
        await fetchUserWithRole()
      }
    }
    initialFetch()

    // Listen for auth state changes with debouncing
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return
        
        // Clear any pending auth change timeout
        if (authChangeTimeout) {
          clearTimeout(authChangeTimeout)
        }
        
        // Debounce auth state changes to prevent rapid re-authentication
        authChangeTimeout = setTimeout(async () => {
          if (!isMounted) return
          
          console.log('Auth state changed:', event, session?.user?.email || 'no user')
          
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('User signed in, fetching user with role...')
            await fetchUserWithRole(true)
          } else if (event === 'SIGNED_OUT' || !session) {
            console.log('User signed out, clearing user state')
            setUser(null)
            setLoading(false)
            setIsInitialized(true)
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            console.log('Token refreshed, updating user...')
            // Don't show loading for token refresh if we already have a user
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
              }
            } else {
              await fetchUserWithRole(true)
            }
          }
        }, 500) // 500ms debounce
      }
    )

    // Handle window visibility change to prevent unnecessary auth checks
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isInitialized) {
        // Only check auth if the user was previously signed in and the page has been hidden for a while
        console.log('Window became visible, checking auth state silently...')
        // Don't show loading state for visibility changes
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session && user) {
            // User was signed out while away
            console.log('User session expired while away')
            setUser(null)
          }
        })
      }
    }

    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }

    return () => {
      isMounted = false
      clearTimeout(loadingTimeout)
      if (authChangeTimeout) {
        clearTimeout(authChangeTimeout)
      }
      subscription.unsubscribe()
      if (typeof window !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, []) // Only run once on mount

  return (
    <AuthContext.Provider value={{ user, loading, isInitialized, signOut, refreshUser }}>
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

// Specific role hooks for convenience
export function useIsAdmin() {
  const { user } = useAuth()
  const adminRoles: AdminRole[] = ['super_admin', 'content_manager', 'customer_support']
  return user?.admin_role ? adminRoles.includes(user.admin_role) : false
}

export function useIsSuperAdmin() {
  const { user } = useAuth()
  return user?.admin_role === 'super_admin'
}

export function useCanManageContent() {
  const { user } = useAuth()
  const contentRoles: AdminRole[] = ['super_admin', 'content_manager']
  return user?.admin_role ? contentRoles.includes(user.admin_role) : false
}

export function useCanManageUsers() {
  const { user } = useAuth()
  return user?.admin_role === 'super_admin'
}

export function useCanHandleSupport() {
  const { user } = useAuth()
  const supportRoles: AdminRole[] = ['super_admin', 'content_manager', 'customer_support']
  return user?.admin_role ? supportRoles.includes(user.admin_role) : false
}
