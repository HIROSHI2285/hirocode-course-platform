import { z } from 'zod'

// ==========================================
// 基本的なスキーマ
// ==========================================

// UUID検証
export const uuidSchema = z.string().uuid({ message: '無効なIDです' })

// URL検証
export const urlSchema = z.string().url({ message: '無効なURLです' }).optional()

// ==========================================
// 講座関連スキーマ
// ==========================================

export const courseSchema = z.object({
  title: z.string()
    .min(1, { message: 'タイトルは必須です' })
    .max(100, { message: 'タイトルは100文字以下にしてください' })
    .trim()
    .refine(val => val.length > 0, { message: 'タイトルは空白のみにはできません' }),

  description: z.string()
    .max(1000, { message: '説明は1000文字以下にしてください' })
    .trim()
    .optional(),

  thumbnail_url: z.string()
    .url({ message: '無効なサムネイルURLです' })
    .max(500, { message: 'URLは500文字以下にしてください' })
    .optional()
    .or(z.literal(''))
})

export const courseUpdateSchema = courseSchema.extend({
  id: uuidSchema
})

export const courseDeleteSchema = z.object({
  id: uuidSchema
})

// ==========================================
// 認証関連スキーマ
// ==========================================

export const redirectSchema = z.string()
  .max(200, { message: 'リダイレクトURLが長すぎます' })
  .refine(val => {
    // 相対パスまたは同一ドメインのみ許可
    return val.startsWith('/') || val.startsWith(process.env.NEXTAUTH_URL || 'http://localhost:3000')
  }, { message: '無効なリダイレクト先です' })
  .optional()

export const oauthSchema = z.object({
  redirect: redirectSchema
})

// ==========================================
// 検索関連スキーマ
// ==========================================

export const searchQuerySchema = z.object({
  q: z.string()
    .max(200, { message: '検索クエリは200文字以下にしてください' })
    .trim()
    .default(''),

  category: z.string()
    .max(50, { message: 'カテゴリは50文字以下にしてください' })
    .optional(),

  duration: z.enum(['short', 'medium', 'long'], {
    errorMap: () => ({ message: '無効な再生時間フィルターです' })
  }).optional(),

  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: '無効な難易度フィルターです' })
  }).optional(),

  isFree: z.enum(['true', 'false'], {
    errorMap: () => ({ message: '無効な料金フィルターです' })
  }).optional(),

  limit: z.string()
    .regex(/^\d+$/, { message: '無効な制限値です' })
    .transform(val => parseInt(val, 10))
    .refine(val => val >= 1 && val <= 100, {
      message: '制限値は1から100の間である必要があります'
    })
    .default('20')
})

export const searchSuggestionsSchema = z.object({
  q: z.string()
    .max(200, { message: '検索クエリは200文字以下にしてください' })
    .trim()
    .default('')
})

// ==========================================
// セクション・レッスン関連スキーマ
// ==========================================

export const sectionSchema = z.object({
  title: z.string()
    .min(1, { message: 'セクションタイトルは必須です' })
    .max(100, { message: 'セクションタイトルは100文字以下にしてください' })
    .trim(),

  course_id: uuidSchema,

  order_index: z.number()
    .int({ message: '順序は整数である必要があります' })
    .min(0, { message: '順序は0以上である必要があります' })
})

export const lessonSchema = z.object({
  title: z.string()
    .min(1, { message: 'レッスンタイトルは必須です' })
    .max(100, { message: 'レッスンタイトルは100文字以下にしてください' })
    .trim(),

  description: z.string()
    .max(1000, { message: 'レッスン説明は1000文字以下にしてください' })
    .trim()
    .optional(),

  youtube_url: z.string()
    .url({ message: '無効なYouTube URLです' })
    .refine(val => {
      // YouTube URLの形式をチェック
      const youtubeRegex = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/
      return youtubeRegex.test(val)
    }, { message: '有効なYouTube URLを入力してください' }),

  section_id: uuidSchema,

  duration: z.number()
    .int({ message: '再生時間は整数である必要があります' })
    .min(1, { message: '再生時間は1秒以上である必要があります' })
    .max(86400, { message: '再生時間は24時間以下である必要があります' }) // 24時間上限
    .optional(),

  order_index: z.number()
    .int({ message: '順序は整数である必要があります' })
    .min(0, { message: '順序は0以上である必要があります' }),

  is_free: z.boolean().optional().default(false)
})

// ==========================================
// バリデーション実行用ヘルパー関数
// ==========================================

export class ValidationError extends Error {
  constructor(public errors: z.ZodError) {
    super('バリデーションエラー')
    this.name = 'ValidationError'
  }
}

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error)
    }
    throw error
  }
}

export function safeValidateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data)
  return result
}

// ==========================================
// XSS対策・サニタイゼーション
// ==========================================

export function sanitizeHtml(input: string): string {
  // 基本的なHTMLタグとスクリプトを除去
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
}

export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') {
    return ''
  }
  return sanitizeHtml(input)
}

// ==========================================
// レート制限用ヘルパー
// ==========================================

const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1分
): boolean {
  const now = Date.now()
  const current = requestCounts.get(identifier)

  if (!current || now > current.resetTime) {
    // 新しいウィンドウまたはリセット時間経過
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (current.count >= maxRequests) {
    return false // レート制限に引っかかった
  }

  current.count++
  return true
}

export class RateLimitError extends Error {
  constructor() {
    super('レート制限に達しました。しばらく待ってから再試行してください。')
    this.name = 'RateLimitError'
  }
}

// ==========================================
// API用ヘルパー関数
// ==========================================

export async function getRateLimitKey(request?: Request): Promise<string> {
  // Vercelの場合はx-forwarded-for、ローカルの場合はx-real-ipを使用
  const forwarded = request?.headers.get('x-forwarded-for')
  const realIp = request?.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0].trim() || realIp || 'unknown'
  return `api:${ip}`
}