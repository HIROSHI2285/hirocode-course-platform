'use client'

import { useState } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [settings, setSettings] = useState({
    siteName: 'HiroCodeオンライン講座',
    siteDescription: 'プログラミングとAI開発を学習',
    allowRegistration: true,
    requireEmailVerification: false,
    maintenanceMode: false,
    maxUploadSize: 100,
    sessionTimeout: 24,
    emailFrom: 'noreply@hirocode.com',
    emailSupport: 'support@hirocode.com'
  })

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    // サンプル実装：実際にはデータベースに保存
    await new Promise(resolve => setTimeout(resolve, 1000))

    setMessage('設定を保存しました')
    setSaving(false)

    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* パンくずナビ */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li>
              <Link href="/admin" className="hover:text-purple-600">
                管理画面
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">設定</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            システム設定
          </h1>
          <p className="text-gray-600">
            プラットフォームの全体設定を管理
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

        {/* 一般設定 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            一般設定
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                サイト名
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                サイト説明
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  新規登録を許可
                </h3>
                <p className="text-sm text-gray-500">
                  新しいユーザーのアカウント作成を許可する
                </p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, allowRegistration: !prev.allowRegistration }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.allowRegistration ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.allowRegistration ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  メールアドレス確認を必須にする
                </h3>
                <p className="text-sm text-gray-500">
                  登録時にメールアドレスの確認を必須とする
                </p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, requireEmailVerification: !prev.requireEmailVerification }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.requireEmailVerification ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.requireEmailVerification ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  メンテナンスモード
                </h3>
                <p className="text-sm text-gray-500">
                  サイトをメンテナンスモードにする（管理者のみアクセス可）
                </p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* アップロード設定 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            アップロード設定
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大アップロードサイズ（MB）
              </label>
              <input
                type="number"
                value={settings.maxUploadSize}
                onChange={(e) => setSettings(prev => ({ ...prev, maxUploadSize: parseInt(e.target.value) }))}
                min="1"
                max="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                画像やファイルの最大アップロードサイズ
              </p>
            </div>
          </div>
        </div>

        {/* セッション設定 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            セッション設定
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                セッションタイムアウト（時間）
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                min="1"
                max="168"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                ユーザーが自動的にログアウトされるまでの時間
              </p>
            </div>
          </div>
        </div>

        {/* メール設定 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            メール設定
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                送信元メールアドレス
              </label>
              <input
                type="email"
                value={settings.emailFrom}
                onChange={(e) => setSettings(prev => ({ ...prev, emailFrom: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                サポートメールアドレス
              </label>
              <input
                type="email"
                value={settings.emailSupport}
                onChange={(e) => setSettings(prev => ({ ...prev, emailSupport: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* データベース情報 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            データベース情報
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">データベース種別</span>
              <span className="font-medium text-gray-900">PostgreSQL (Supabase)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-200">
              <span className="text-gray-600">接続状態</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                接続中
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-200">
              <span className="text-gray-600">RLS（Row Level Security）</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                有効
              </span>
            </div>
          </div>
        </div>

        {/* システム情報 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            システム情報
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">プラットフォーム</span>
              <span className="font-medium text-gray-900">Next.js 15.5.4</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-200">
              <span className="text-gray-600">Node.js バージョン</span>
              <span className="font-medium text-gray-900">{process.version}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-200">
              <span className="text-gray-600">デプロイ環境</span>
              <span className="font-medium text-gray-900">
                {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
              </span>
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

          <div className="text-sm text-gray-500">
            最終更新: {new Date().toLocaleString('ja-JP')}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
