// 画像最適化ユーティリティ関数

/**
 * ブラープレースホルダー用のBase64画像を生成
 */
export function generateBlurDataURL(width: number = 8, height: number = 6): string {
  const canvas = typeof window !== 'undefined' ? document.createElement('canvas') : null

  if (!canvas) {
    // サーバーサイド用の静的ブラーDataURL
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAGAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
  }

  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (!ctx) return ''

  // グラデーション背景を作成
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#f3f4f6')
  gradient.addColorStop(1, '#e5e7eb')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  return canvas.toDataURL('image/jpeg', 0.1)
}

/**
 * YouTube URLからビデオIDを抽出（パラメータを適切に処理）
 */
export function extractYouTubeVideoId(url: string): string | null {
  // URLパラメータをクリーンアップ
  const cleanUrl = url.split('&')[0] // &以降のパラメータを除去
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/
  const match = cleanUrl.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

/**
 * YouTube サムネイルURLを生成（複数の解像度に対応）
 */
export function getYouTubeThumbnailUrls(videoId: string) {
  return {
    maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    hq: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    mq: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    sd: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    default: `https://img.youtube.com/vi/${videoId}/default.jpg`
  }
}

/**
 * 画像URLの前後の空白を削除
 */
export function sanitizeImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null

  // より厳密な空白文字の削除（先頭と末尾の制御文字も含む）
  const trimmed = url.replace(/^[\s\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+|[\s\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+$/g, '')
  return trimmed || null
}

/**
 * 有効な画像URLかチェック（example.comは除外）
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  // まずURLをサニタイズ
  const sanitizedUrl = sanitizeImageUrl(url)

  // sanitizedUrlがnullまたはundefinedの場合はfalseを返す
  if (!sanitizedUrl) return false

  return !!(
    !sanitizedUrl.includes('example.com') &&
    (sanitizedUrl.startsWith('https://') || sanitizedUrl.startsWith('http://')) &&
    (/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(sanitizedUrl) ||
    sanitizedUrl.includes('youtube.com') ||
    sanitizedUrl.includes('youtu.be')))
}

/**
 * 講座カード用のプレースホルダー画像を生成
 */
export function getPlaceholderImage(title: string): string {
  const colors = [
    'bg-gradient-to-br from-blue-500 to-blue-600',
    'bg-gradient-to-br from-green-500 to-green-600',
    'bg-gradient-to-br from-purple-500 to-purple-600',
    'bg-gradient-to-br from-orange-500 to-orange-600',
    'bg-gradient-to-br from-pink-500 to-pink-600',
    'bg-gradient-to-br from-indigo-500 to-indigo-600',
    'bg-gradient-to-br from-red-500 to-red-600',
    'bg-gradient-to-br from-teal-500 to-teal-600'
  ]
  const colorIndex = title.length % colors.length
  return colors[colorIndex]
}

/**
 * 画像読み込みエラー時のフォールバック
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>
): void {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'

  // 親要素にエラークラスを追加
  const parent = img.parentElement
  if (parent) {
    parent.classList.add('image-error')
  }
}

/**
 * 遅延読み込み用のIntersection Observer設定
 */
export function createImageObserver(callback: IntersectionObserverCallback): IntersectionObserver | null {
  if (typeof window === 'undefined') return null

  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  })
}