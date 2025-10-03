import { NextRequest, NextResponse } from 'next/server'
import { getCategories } from '@/lib/search'
import {
  checkRateLimit,
  RateLimitError,
  getRateLimitKey
} from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    // レート制限チェック (10リクエスト/分)
    const rateLimitKey = await getRateLimitKey(request)
    if (!checkRateLimit(rateLimitKey, 10, 60000)) {
      return NextResponse.json(
        { error: 'リクエスト数が多すぎます。しばらく待ってから再試行してください。' },
        { status: 429 }
      )
    }

    const categories = await getCategories()
    return NextResponse.json(categories)

  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      )
    }

    console.error('[API Error] Categories:', error)
    return NextResponse.json(
      { error: 'カテゴリ取得に失敗しました' },
      { status: 500 }
    )
  }
}