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
    // レート制限チェック（ログイン試行: 10回/5分）
    const rateLimitKey = await getRateLimitKey()
    if (!checkRateLimit(rateLimitKey, 10, 300000)) {
      throw new RateLimitError()
    }

    // 入力データの取得とサニタイゼーション
    const rawRedirect = sanitizeInput(formData.get('redirect'))

    // リダイレクト先の検証
    const validatedRedirect = rawRedirect ? validateData(redirectSchema, rawRedirect) : '/courses'

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getURL()}/auth/callback?redirect=${encodeURIComponent(validatedRedirect || '')}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error('Google OAuth エラー:', error)
      redirect('/login?error=oauth_error')
    }

    if (data.url) {
      redirect(data.url)
    }
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