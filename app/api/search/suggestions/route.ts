import { NextRequest, NextResponse } from 'next/server'
import { getSearchSuggestions } from '@/lib/search'
import {
  searchSuggestionsSchema,
  ValidationError,
  checkRateLimit,
  RateLimitError,
  getRateLimitKey
} from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    // レート制限チェック (30リクエスト/分 - サジェストは頻繁に呼ばれる)
    const rateLimitKey = await getRateLimitKey(request)
    if (!checkRateLimit(rateLimitKey, 30, 60000)) {
      return NextResponse.json(
        { error: 'リクエスト数が多すぎます。しばらく待ってから再試行してください。' },
        { status: 429 }
      )
    }

    // クエリパラメータの取得と検証
    const { searchParams } = new URL(request.url)
    const rawParams = {
      q: searchParams.get('q') || '',
    }

    // 入力検証
    const parsed = searchSuggestionsSchema.safeParse(rawParams)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const validatedParams = parsed.data

    const suggestions = await getSearchSuggestions(validatedParams.q)
    return NextResponse.json(suggestions)

  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: error.errors.issues },
        { status: 400 }
      )
    }

    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      )
    }

    // 本番環境では詳細なエラーを隠す
    console.error('[API Error] Search Suggestions:', error)
    return NextResponse.json(
      { error: 'サジェスト取得に失敗しました' },
      { status: 500 }
    )
  }
}