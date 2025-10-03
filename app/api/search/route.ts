import { NextRequest, NextResponse } from 'next/server'
import { searchContent } from '@/lib/search'
import type { SearchFilters } from '@/types/search'
import {
  searchQuerySchema,
  ValidationError,
  checkRateLimit,
  RateLimitError,
  getRateLimitKey
} from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    // レート制限チェック (20リクエスト/分)
    const rateLimitKey = await getRateLimitKey(request)
    if (!checkRateLimit(rateLimitKey, 20, 60000)) {
      return NextResponse.json(
        { error: 'リクエスト数が多すぎます。しばらく待ってから再試行してください。' },
        { status: 429 }
      )
    }

    // クエリパラメータの取得と検証
    const { searchParams } = new URL(request.url)
    const rawParams = {
      q: searchParams.get('q') || '',
      category: searchParams.get('category') ?? undefined,
      duration: searchParams.get('duration') ?? undefined,
      difficulty: searchParams.get('difficulty') ?? undefined,
      isFree: searchParams.get('isFree') ?? undefined,
      limit: searchParams.get('limit') || '20',
    }

    // 入力検証
    const parsed = searchQuerySchema.safeParse(rawParams)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const validatedParams = parsed.data

    const filters: SearchFilters = {
      category: validatedParams.category,
      duration: validatedParams.duration,
      difficulty: validatedParams.difficulty,
      isFree: validatedParams.isFree ? validatedParams.isFree === 'true' : undefined
    }

    const results = await searchContent(
      validatedParams.q,
      filters,
      validatedParams.limit
    )

    return NextResponse.json(results)

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
    console.error('[API Error] Search:', error)
    return NextResponse.json(
      { error: '検索に失敗しました' },
      { status: 500 }
    )
  }
}