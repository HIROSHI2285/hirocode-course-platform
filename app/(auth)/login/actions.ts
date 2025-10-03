'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getURL } from '@/lib/utils'

export async function loginWithGoogle() {
  try {
    console.log('[AUTH] Starting Google OAuth')

    const supabase = await createClient()
    const siteUrl = getURL()
    const redirectTo = `${siteUrl}auth/callback`

    console.log('[AUTH] Site URL:', siteUrl)
    console.log('[AUTH] Redirect To:', redirectTo)

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    })

    console.log('[AUTH] OAuth response:', { data, error })

    if (error) {
      console.error('[AUTH] OAuth error:', error)
      redirect('/login?error=oauth_error')
    }

    if (data.url) {
      console.log('[AUTH] Redirecting to:', data.url)
      redirect(data.url)
    }

    console.log('[AUTH] No URL returned')
    redirect('/login?error=no_url')
  } catch (error) {
    console.error('[AUTH] Unexpected error:', error)
    redirect('/login?error=server_error')
  }
}