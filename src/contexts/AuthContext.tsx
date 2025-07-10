'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { type AdminRole, type UserWithRole } from '@/utils/auth/roles-client'
import { Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: UserWithRole | null
  loading: boolean
  isInitialized: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  session: Session | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const supabase = createClient()

  const fetchUserWithRole = async (forceRefresh = false) => {
    try {
      console.log('Fetching user with role...', { forceRefresh })
      setIsInitialized(false)
      
      if (!isInitialized || forceRefresh) {
        setLoading(true)
      }
      
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
        setSession(null)
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
          console.log('Setting user with default role:', userWithRole)
          setUser(userWithRole)
          setSession(session)
        } else {
          const userWithRole = {
            id: authUser.id,
            email: authUser.email || '',
            admin_role: 'user' as AdminRole,
            full_name: authUser.user_metadata?.full_name || ''
          }
          console.log('Setting user without profile due to error:', userWithRole)
          setUser(userWithRole)
          setSession(session)
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
        setSession(session)
      }
    } catch (error) {
      console.error('Error fetching user with role:', error)
      setUser(null)
      setSession(null)
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
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Supabase sign out error:', error)
      }
      
      setUser(null)
      setSession(null)
      
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Error during sign out:', error)
      setUser(null)
      setSession(null)
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

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isInitialized) {
        console.log('Window became visible, checking auth state silently...')
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session && user) {
            console.log('User session expired while away')
            setUser(null)
            setSession(null)
          }
        })
      }
    }

    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }

    return () => {
      isMounted = false
      subscription.unsubscribe()
      if (typeof window !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, []) // Only run once on mount

  return (
    <AuthContext.Provider value={{ user, loading, isInitialized, signOut, refreshUser, session }}>
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