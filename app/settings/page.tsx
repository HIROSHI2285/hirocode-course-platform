'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [settings, setSettings] = useState({
    emailNotifications: true,
    progressNotifications: true,
    marketingEmails: false,
    language: 'ja',
    timezone: 'Asia/Tokyo'
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/settings')
      } else {
        setUser(user)
      }
      setLoading(false)
    }
    getUser()
  }, [router, supabase])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    // サンプル実装：実際にはデータベースに保存
    await new Promise(resolve => setTimeout(resolve, 1000))

    setMessage('設定を保存しました')
    setSaving(false)

    setTimeout(() => setMessage(''), 3000)
  }

  const handleDeleteAccount = async () => {
    if (!confirm('本当にアカウントを削除しますか？この操作は取り消せません。')) {
      return
    }

    if (!confirm('すべての学習データが削除されます。本当によろしいですか？')) {
      return
    }

    setSaving(true)
    // サンプル実装：実際にはアカウント削除処理
    await new Promise(resolve => setTimeout(resolve, 1500))

    alert('アカウント削除リクエストを受け付けました。確認メールをご確認ください。')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            アカウント設定
          </h1>
          <p className="text-gray-600">
            プロフィールと通知の設定を管理
          </p>
        </div>

        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800">{message}</span>
          </div>
        )}

        {/* プロフィール情報 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            プロフィール情報
          </h2>

          <div className="flex items-start space-x-6 mb-6">
            <div className="flex-shrink-0">
              {user.user_metadata?.avatar_url ? (
                <Image
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata?.full_name || 'User'}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 font-bold text-2xl">
                    {user.user_metadata?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  名前
                </label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                  {user.user_metadata?.full_name || 'N/A'}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  名前はGoogleアカウントから取得されます
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                  {user.email}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  メールアドレスはGoogleアカウントから取得されます
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 通知設定 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            通知設定
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  メール通知
                </h3>
                <p className="text-sm text-gray-500">
                  重要なお知らせをメールで受け取る
                </p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  進捗通知
                </h3>
                <p className="text-sm text-gray-500">
                  学習の進捗状況をお知らせ
                </p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, progressNotifications: !prev.progressNotifications }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.progressNotifications ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.progressNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  マーケティングメール
                </h3>
                <p className="text-sm text-gray-500">
                  新しい講座やキャンペーン情報を受け取る
                </p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, marketingEmails: !prev.marketingEmails }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.marketingEmails ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 言語・地域設定 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            言語・地域設定
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                言語
              </label>
              <select
                value={settings.language}
                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="ja">日本語</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タイムゾーン
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="Asia/Tokyo">日本 (JST)</option>
                <option value="America/New_York">ニューヨーク (EST)</option>
                <option value="Europe/London">ロンドン (GMT)</option>
                <option value="Asia/Shanghai">上海 (CST)</option>
              </select>
            </div>
          </div>
        </div>

        {/* セキュリティ */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            セキュリティ
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  認証方法
                </h3>
                <p className="text-sm text-gray-500">
                  Google OAuth 2.0
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                有効
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  最終ログイン
                </h3>
                <p className="text-sm text-gray-500">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString('ja-JP')
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  アカウント作成日
                </h3>
                <p className="text-sm text-gray-500">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString('ja-JP')
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* アクション */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {saving ? '保存中...' : '設定を保存'}
          </button>

          <button
            onClick={handleDeleteAccount}
            disabled={saving}
            className="px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            アカウントを削除
          </button>
        </div>
      </div>
    </div>
  )
}
