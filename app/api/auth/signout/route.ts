import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import {
  checkRateLimit,
  RateLimitError,
  getRateLimitKey
} from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // レート制限チェック (5リクエスト/分)
    const rateLimitKey = await getRateLimitKey(request)
    if (!checkRateLimit(rateLimitKey, 5, 60000)) {
      return NextResponse.json(
        { error: 'リクエスト数が多すぎます。しばらく待ってから再試行してください。' },
        { status: 429 }
      )
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('[API Error] Signout:', error.message)
      return NextResponse.json(
        { error: 'サインアウトに失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      )
    }

    console.error('[API Error] Signout:', error)
    return NextResponse.json(
      { error: 'サインアウトに失敗しました' },
      { status: 500 }
    )
  }
}