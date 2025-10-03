'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getURL } from '@/lib/utils'
import {
  redirectSchema,
  validateData,
  ValidationError,
  checkRateLimit,
  RateLimitError,
  sanitizeInput
} from '@/lib/validation'
import { headers } from 'next/headers'

// レート制限のヘルパー関数
async function getRateLimitKey(): Promise<string> {
  const headersList = await headers()
  const forwarded = headersList.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown'
  return `login_attempts_${ip}`
}

export async function loginWithGoogle(formData: FormData) {
  try {
    console.log('[AUTH DEBUG] Starting loginWithGoogle')

    // レート制限チェック（ログイン試行: 10回/5分）
    const rateLimitKey = await getRateLimitKey()
    console.log('[AUTH DEBUG] Rate limit key:', rateLimitKey)

    if (!checkRateLimit(rateLimitKey, 10, 300000)) {
      throw new RateLimitError()
    }

    // 入力データの取得とサニタイゼーション
    const rawRedirect = sanitizeInput(formData.get('redirect'))
    console.log('[AUTH DEBUG] Raw redirect:', rawRedirect)

    // リダイレクト先の検証
    const validatedRedirect = rawRedirect ? validateData(redirectSchema, rawRedirect) : '/courses'
    console.log('[AUTH DEBUG] Validated redirect:', validatedRedirect)

    const supabase = await createClient()

    const siteUrl = getURL()
    const redirectTo = `${siteUrl}auth/callback?redirect=${encodeURIComponent(validatedRedirect || '')}`
    console.log('[AUTH DEBUG] Site URL:', siteUrl)
    console.log('[AUTH DEBUG] Redirect To:', redirectTo)

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    console.log('[AUTH DEBUG] OAuth response - data:', data)
    console.log('[AUTH DEBUG] OAuth response - error:', error)

    if (error) {
      console.error('Google OAuth エラー:', error)
      redirect('/login?error=oauth_error')
    }

    if (data.url) {
      console.log('[AUTH DEBUG] Redirecting to OAuth URL:', data.url)
      redirect(data.url)
    }

    console.log('[AUTH DEBUG] No URL returned from OAuth')
    redirect('/login?error=no_url')
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Login validation error:', error)
      redirect('/login?error=invalid_redirect')
    }
    if (error instanceof RateLimitError) {
      console.error('Login rate limit exceeded')
      redirect('/login?error=rate_limit')
    }
    console.error('Unexpected error in loginWithGoogle:', error)
    redirect('/login?error=server_error')
  }
}