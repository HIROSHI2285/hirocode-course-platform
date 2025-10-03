'use client'

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
})

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // 競合状態を防ぐためのref
  const adminCheckInProgress = useRef<string | null>(null)
  const initialized = useRef(false)

  // 管理者ステータスをチェックする関数（競合状態対策済み）
  const checkAdminStatus = useCallback(async (userId: string) => {
    // 既に同じユーザーの管理者チェックが進行中の場合はスキップ
    if (adminCheckInProgress.current === userId) {
      console.log('Admin check already in progress for user:', userId)
      return
    }

    try {
      adminCheckInProgress.current = userId
      console.log('Checking admin status for user:', userId)

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single()

      console.log('Profile data:', profile)
      console.log('Profile error:', error)

      // チェック完了時に現在のユーザーと一致することを確認
      if (adminCheckInProgress.current === userId) {
        if (error) {
          console.error('Error fetching profile:', error)
          setIsAdmin(false)
        } else {
          const adminStatus = profile?.is_admin || false
          console.log('Setting admin status to:', adminStatus)
          setIsAdmin(adminStatus)
        }
      }
    } catch (error) {
      console.error('Unexpected error in checkAdminStatus:', error)
      if (adminCheckInProgress.current === userId) {
        setIsAdmin(false)
      }
    } finally {
      if (adminCheckInProgress.current === userId) {
        adminCheckInProgress.current = null
      }
    }
  }, [supabase])

  useEffect(() => {
    // 初期化が既に完了している場合は重複実行を防ぐ
    if (initialized.current) return

    let isMounted = true

    const initializeAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!isMounted) return

        setUser(user)

        if (user) {
          await checkAdminStatus(user.id)
        } else {
          setIsAdmin(false)
        }

        if (isMounted) {
          setLoading(false)
          initialized.current = true
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (isMounted) {
          setLoading(false)
          initialized.current = true
        }
      }
    }

    initializeAuth()

    // 認証状態の変更を監視（初期化後のみ）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!initialized.current) return

        console.log('Auth state change:', event, 'Session:', session?.user?.id)

        const newUser = session?.user ?? null
        setUser(newUser)

        if (newUser) {
          await checkAdminStatus(newUser.id)
        } else {
          setIsAdmin(false)
          adminCheckInProgress.current = null
        }

        if (event === 'SIGNED_OUT') {
          console.log('Signing out - redirecting to home')
          setIsAdmin(false)
          adminCheckInProgress.current = null
          router.push('/')
          router.refresh()
        } else if (event === 'SIGNED_IN') {
          console.log('Signed in - refreshing')
          router.refresh()
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [router, supabase, checkAdminStatus])

  const signOut = async () => {
    try {
      setLoading(true)
      // 管理者チェックをクリア
      adminCheckInProgress.current = null

      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      }

      // 状態をクリア
      setUser(null)
      setIsAdmin(false)

      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}