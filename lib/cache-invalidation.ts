// キャッシュ無効化戦略

import { revalidateTag, revalidatePath } from 'next/cache'
import { DATA_CACHE_CONFIG } from '@/lib/cache-config'

/**
 * 条件付きキャッシュ無効化
 */
export class CacheInvalidationManager {

  /**
   * 講座関連のキャッシュを無効化
   */
  static async invalidateCourseCache(courseId?: string) {
    // 講座一覧ページ
    revalidatePath('/courses')

    // 講座詳細ページ（特定のコース）
    if (courseId) {
      revalidatePath(`/courses/${courseId}`)
    }

    // 講座関連のタグベースキャッシュ
    revalidateTag('courses')

    console.log('講座キャッシュを無効化:', courseId || 'all courses')
  }

  /**
   * レッスン関連のキャッシュを無効化
   */
  static async invalidateLessonCache(courseId: string, lessonId?: string) {
    // 講座詳細ページ（レッスンリストも含む）
    revalidatePath(`/courses/${courseId}`)

    // 特定のレッスン詳細ページ
    if (lessonId) {
      revalidatePath(`/courses/${courseId}/lessons/${lessonId}`)
    }

    // レッスン関連のタグベースキャッシュ
    revalidateTag('lessons')

    console.log('レッスンキャッシュを無効化:', { courseId, lessonId })
  }

  /**
   * ユーザー進捗関連のキャッシュを無効化
   */
  static async invalidateProgressCache(userId: string) {
    // ダッシュボードページ
    revalidatePath('/dashboard')

    // 進捗関連のタグベースキャッシュ
    revalidateTag('progress')
    revalidateTag(`user-${userId}`)

    console.log('進捗キャッシュを無効化:', userId)
  }

  /**
   * 検索関連のキャッシュを無効化
   */
  static async invalidateSearchCache() {
    // 検索ページ
    revalidatePath('/search')

    // 検索結果のタグベースキャッシュ
    revalidateTag('search')

    console.log('検索キャッシュを無効化')
  }

  /**
   * 管理者操作による包括的キャッシュ無効化
   */
  static async invalidateAdminCache() {
    // 管理画面
    revalidatePath('/admin')
    revalidatePath('/admin/courses')

    // 全体的なコンテンツキャッシュ
    revalidateTag('admin')
    revalidateTag('courses')
    revalidateTag('lessons')

    console.log('管理者キャッシュを無効化')
  }

  /**
   * サムネイル関連のキャッシュを無効化
   */
  static async invalidateThumbnailCache() {
    // サムネイル関連のタグベースキャッシュ
    revalidateTag('thumbnails')

    // 講座一覧ページ（サムネイル表示）
    revalidatePath('/courses')
    revalidatePath('/')

    console.log('サムネイルキャッシュを無効化')
  }
}

/**
 * タイムベースキャッシュ戦略
 */
export class TimeBasedCacheStrategy {

  /**
   * 時間帯に基づく動的キャッシュ時間を取得
   */
  static getOptimalCacheTime(contentType: keyof typeof DATA_CACHE_CONFIG): number {
    const currentHour = new Date().getHours()
    const baseConfig = DATA_CACHE_CONFIG[contentType]

    // 深夜（0-6時）: 長めのキャッシュ
    if (currentHour >= 0 && currentHour < 6) {
      return baseConfig.revalidate * 2
    }

    // 日中（9-18時）: 標準キャッシュ
    if (currentHour >= 9 && currentHour < 18) {
      return baseConfig.revalidate
    }

    // 夕方・夜（18-24時）: 短めのキャッシュ（アクセス集中時間）
    if (currentHour >= 18 && currentHour < 24) {
      return Math.max(baseConfig.revalidate * 0.5, 300) // 最低5分
    }

    // 早朝（6-9時）: 中程度のキャッシュ
    return baseConfig.revalidate * 1.5
  }

  /**
   * アクセス頻度に基づくキャッシュ戦略
   */
  static getFrequencyBasedCacheTime(
    contentType: keyof typeof DATA_CACHE_CONFIG,
    accessCount: number
  ): number {
    const baseConfig = DATA_CACHE_CONFIG[contentType]

    // 高頻度アクセス（100+/hour）: 短いキャッシュ
    if (accessCount > 100) {
      return Math.max(baseConfig.revalidate * 0.3, 180) // 最低3分
    }

    // 中頻度アクセス（10-100/hour）: 標準キャッシュ
    if (accessCount > 10) {
      return baseConfig.revalidate
    }

    // 低頻度アクセス（10未満/hour）: 長いキャッシュ
    return baseConfig.revalidate * 3
  }
}

/**
 * キャッシュパフォーマンス監視
 */
export class CachePerformanceMonitor {

  /**
   * キャッシュヒット率を計算
   */
  static calculateHitRate(hits: number, total: number): number {
    return total > 0 ? (hits / total) * 100 : 0
  }

  /**
   * キャッシュ効果をログ出力
   */
  static logCachePerformance(metric: {
    page: string
    hitRate: number
    responseTime: number
    cacheAge: number
  }) {
    const { page, hitRate, responseTime, cacheAge } = metric

    console.log(`[Cache Performance] ${page}`)
    console.log(`  Hit Rate: ${hitRate.toFixed(1)}%`)
    console.log(`  Response Time: ${responseTime}ms`)
    console.log(`  Cache Age: ${cacheAge}s`)

    // パフォーマンス警告
    if (hitRate < 70) {
      console.warn(`⚠️ Low cache hit rate for ${page}: ${hitRate.toFixed(1)}%`)
    }

    if (responseTime > 1000) {
      console.warn(`⚠️ Slow response time for ${page}: ${responseTime}ms`)
    }
  }
}

/**
 * プロダクション用キャッシュ最適化
 */
export class ProductionCacheOptimizer {

  /**
   * 本番環境での最適化されたキャッシュ設定
   */
  static getProductionCacheConfig(pageType: string) {
    const isProduction = process.env.NODE_ENV === 'production'

    if (!isProduction) {
      return { revalidate: 10 } // 開発環境では短いキャッシュ
    }

    // 本番環境での最適化
    const optimizedConfigs: Record<string, { revalidate: number }> = {
      'home': { revalidate: 7200 }, // 2時間
      'courses': { revalidate: 3600 }, // 1時間
      'courseDetail': { revalidate: 1800 }, // 30分
      'lessonDetail': { revalidate: 1800 }, // 30分
      'search': { revalidate: 900 }, // 15分
      'dashboard': { revalidate: 0 }, // リアルタイム
      'admin': { revalidate: 0 }, // リアルタイム
    }

    return optimizedConfigs[pageType] || { revalidate: 1800 }
  }

  /**
   * CDN統合キャッシュヘッダー
   */
  static getCDNCacheHeaders(pageType: string) {
    const config = this.getProductionCacheConfig(pageType)

    return {
      'Cache-Control': `public, s-maxage=${config.revalidate}, stale-while-revalidate=${config.revalidate * 2}`,
      'CDN-Cache-Control': `public, max-age=${config.revalidate}`,
      'Vercel-CDN-Cache-Control': `public, s-maxage=${config.revalidate}, stale-while-revalidate=${config.revalidate * 10}`
    }
  }
}