import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, type Profile } from './supabase'
import type { Session } from '@supabase/supabase-js'

type AuthContextType = {
  session: Session | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, role: 'buyer' | 'vendor', phone?: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    setProfile(data as Profile | null)
    return data as Profile | null
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        (async () => {
          await fetchProfile(session.user.id)
        })()
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp: AuthContextType['signUp'] = async (email, password, fullName, role, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    })

    if (error) return { error: error.message }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          role,
          phone: phone || null,
        })

      if (profileError) {
        return { error: profileError.message }
      }
    }

    return { error: null }
  }

  const signIn: AuthContextType['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (session?.user) {
      await fetchProfile(session.user.id)
    }
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
