// キャッシュ戦略設定

/**
 * ページタイプ別キャッシュ戦略
 */
export const CACHE_STRATEGIES = {
  // 静的コンテンツ（あまり変更されない）
  STATIC: {
    revalidate: 3600, // 1時間
    description: 'ホームページ、About、利用規約など'
  },

  // 準静的コンテンツ（時々更新される）
  SEMI_STATIC: {
    revalidate: 1800, // 30分
    description: '講座一覧、講座詳細（一般ユーザー向け）'
  },

  // 動的コンテンツ（頻繁に更新される）
  DYNAMIC: {
    revalidate: 300, // 5分
    description: 'ダッシュボード、進捗ページ'
  },

  // リアルタイム（常に最新が必要）
  REALTIME: {
    revalidate: 0, // キャッシュなし
    description: '管理画面、ライブ機能'
  },

  // 長期キャッシュ（めったに変更されない）
  LONG_TERM: {
    revalidate: 86400, // 24時間
    description: 'サイトマップ、プライバシーポリシーなど'
  }
} as const

/**
 * ページ固有のキャッシュ設定
 */
export const PAGE_CACHE_CONFIG = {
  // 一般ユーザー向けページ
  home: CACHE_STRATEGIES.STATIC,
  courses: CACHE_STRATEGIES.SEMI_STATIC,
  courseDetail: CACHE_STRATEGIES.SEMI_STATIC,
  lessonDetail: CACHE_STRATEGIES.SEMI_STATIC,

  // ユーザー専用ページ
  dashboard: CACHE_STRATEGIES.DYNAMIC,
  progress: CACHE_STRATEGIES.DYNAMIC,
  search: CACHE_STRATEGIES.SEMI_STATIC,

  // 管理者向けページ
  admin: CACHE_STRATEGIES.REALTIME,
  adminCourses: CACHE_STRATEGIES.REALTIME,
  adminVideos: CACHE_STRATEGIES.REALTIME,
  adminUsers: CACHE_STRATEGIES.REALTIME,

  // 静的ページ
  privacy: CACHE_STRATEGIES.LONG_TERM,
  terms: CACHE_STRATEGIES.LONG_TERM,
  about: CACHE_STRATEGIES.LONG_TERM
} as const

/**
 * データタイプ別キャッシュ戦略
 */
export const DATA_CACHE_CONFIG = {
  // 講座データ
  courses: {
    revalidate: 1800, // 30分
    tags: ['courses'], // キャッシュタグ
    description: '講座一覧データ'
  },

  // 講座詳細
  courseDetail: {
    revalidate: 3600, // 1時間
    tags: ['courses', 'lessons'], // キャッシュタグ
    description: '講座詳細とレッスンデータ'
  },

  // ユーザー進捗
  userProgress: {
    revalidate: 300, // 5分
    tags: ['progress'], // キャッシュタグ
    description: 'ユーザーの学習進捗'
  },

  // ユーザープロフィール
  userProfile: {
    revalidate: 600, // 10分
    tags: ['users'], // キャッシュタグ
    description: 'ユーザープロフィール情報'
  },

  // サムネイル
  thumbnails: {
    revalidate: 7200, // 2時間
    tags: ['thumbnails'], // キャッシュタグ
    description: 'YouTubeサムネイル情報'
  }
} as const

/**
 * 条件付きキャッシュ戦略
 */
export function getOptimalCacheStrategy(context: {
  isAuthenticated: boolean
  isAdmin: boolean
  pageType: keyof typeof PAGE_CACHE_CONFIG
}): { revalidate: number; tags?: string[] } {
  const { isAuthenticated, isAdmin, pageType } = context

  // 管理者は常にリアルタイム
  if (isAdmin && pageType.startsWith('admin')) {
    return { revalidate: 0, tags: ['admin'] }
  }

  // 認証済みユーザーの動的ページ
  if (isAuthenticated && ['dashboard', 'progress'].includes(pageType)) {
    return {
      revalidate: CACHE_STRATEGIES.DYNAMIC.revalidate,
      tags: ['user-data']
    }
  }

  // デフォルト設定
  return {
    revalidate: PAGE_CACHE_CONFIG[pageType]?.revalidate || CACHE_STRATEGIES.SEMI_STATIC.revalidate,
    tags: [pageType]
  }
}

/**
 * ISR（Incremental Static Regeneration）設定
 */
export const ISR_CONFIG = {
  // 静的生成対象ページ
  generateStaticParams: {
    courses: {
      limit: 50, // 最大50講座を事前生成
      description: '人気講座を事前に静的生成'
    },
    lessons: {
      limit: 100, // 最大100レッスンを事前生成
      description: 'アクセス頻度の高いレッスンを事前生成'
    }
  },

  // オンデマンド生成設定
  onDemand: {
    maxAge: 3600, // 1時間
    staleWhileRevalidate: 7200, // 2時間（バックグラウンド更新）
    description: 'アクセス時に動的生成、バックグラウンドで更新'
  }
} as const

/**
 * 開発環境用設定
 */
export const DEV_CACHE_CONFIG = {
  // 開発時は短いキャッシュ時間
  revalidate: process.env.NODE_ENV === 'development' ? 10 : undefined,
  description: '開発環境では10秒キャッシュで快適な開発体験'
} as const