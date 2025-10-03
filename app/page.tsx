import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import CourseCard from '@/components/features/CourseCard'
import type { Course } from '@/types/database'

// モックデータ（人気の講座3つ）- YouTubeサムネイル風
const mockFeaturedCourses: Course[] = [
  {
    id: '1',
    title: 'React + Next.js 完全マスター講座',
    description: 'Reactの基礎からNext.jsを使った本格的なWebアプリケーション開発まで学べます。',
    thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    title: 'AI開発入門 - Python & TensorFlow',
    description: '人工知能開発の基礎をPythonとTensorFlowで学習。機械学習の概念から実装まで解説。',
    thumbnail_url: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z'
  },
  {
    id: '3',
    title: 'フルスタック開発講座',
    description: 'フロントエンドからバックエンド、データベースまで。完全なWebアプリケーション開発を学習。',
    thumbnail_url: 'https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z'
  }
]

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen">

      {/* ヒーローセクション - グラデーション背景とモダンレイアウト */}
      <section className="relative min-h-[90vh] bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-blue-400/15 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[70vh]">
            {/* 左側 - テキストコンテンツ */}
            <div className="text-white">
              <div className="mb-8">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  AIプログラミングを学んで
                  <br />
                  <span className="bg-gradient-to-r from-pink-300 to-yellow-300 bg-clip-text text-transparent">
                    新しいキャリアを切り開こう
                  </span>
                </h1>
                <p className="text-lg md:text-xl mb-10 text-purple-100 leading-relaxed">
                  実践的なプログラミングを身につけて、創造性のあるAI技術をプログラミングスキルを学ぼう。
                  業界をリードする講師による解説で、あなたの成長を強力にサポートします。
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-10 py-4 text-lg font-semibold shadow-lg" asChild>
                  <Link href="/courses">
                    コース探索
                  </Link>
                </Button>
                <Button size="lg" className="border-2 border-white text-white hover:bg-white hover:text-purple-700 px-10 py-4 text-lg font-semibold bg-transparent" asChild>
                  <Link href="/login">
                    無料で始める
                  </Link>
                </Button>
              </div>

              {/* 信頼性指標 */}
              <div className="flex flex-wrap gap-8 text-sm text-purple-200">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-pink-400 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-green-400 border-2 border-white"></div>
                  </div>
                  <span>1000+ 受講生が学習中</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    {"★".repeat(5)}
                  </div>
                  <span>4.8/5 の高評価</span>
                </div>
              </div>
            </div>

            {/* 右側 - ヒーロー画像 */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/japanese-woman.jpg"
                  alt="AIプログラミング学習"
                  width={600}
                  height={700}
                  className="object-cover w-full h-[500px] lg:h-[700px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent"></div>
              </div>

              {/* フローティング要素 */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-pink-400 rounded-2xl opacity-80"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-yellow-400 rounded-full opacity-60"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 人気のカテゴリーセクション */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              人気のカテゴリー
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              幅広い分野から、あなたのキャリアを加速させる講座を見つけよう
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                title: "AI・機械学習",
                desc: "人工知能",
                color: "bg-blue-100",
                iconColor: "text-blue-600"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                ),
                title: "Web開発",
                desc: "フロントエンド",
                color: "bg-green-100",
                iconColor: "text-green-600"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
                  </svg>
                ),
                title: "モバイル開発",
                desc: "アプリ作成",
                color: "bg-purple-100",
                iconColor: "text-purple-600"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                ),
                title: "クラウド",
                desc: "インフラ",
                color: "bg-orange-100",
                iconColor: "text-orange-600"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                ),
                title: "DevOps",
                desc: "自動化",
                color: "bg-red-100",
                iconColor: "text-red-600"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: "データサイエンス",
                desc: "分析・可視化",
                color: "bg-teal-100",
                iconColor: "text-teal-600"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                ),
                title: "ブロックチェーン",
                desc: "Web3",
                color: "bg-indigo-100",
                iconColor: "text-indigo-600"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a3 3 0 000-6h-1m4 6V4a3 3 0 114 3v2.5M15 8a3 3 0 000 6H9m6-6a3 3 0 010 6H9m0-6h6" />
                  </svg>
                ),
                title: "ゲーム開発",
                desc: "Unity・UE",
                color: "bg-pink-100",
                iconColor: "text-pink-600"
              }
            ].map((category, index) => (
              <div
                key={index}
                className="group cursor-pointer bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${category.iconColor}`}>
                  {category.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-sm text-gray-600">{category.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 人気講座セクション */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              今すぐ受講できる人気講座
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              実践的なスキルを身につけて、すぐに活用できるコースを厳選
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {mockFeaturedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          <div className="text-center">
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg font-semibold shadow-lg"
              asChild
            >
              <Link href="/courses">
                すべての講座を見る →
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* なぜ私たちのプラットフォームが選ばれるのか */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              なぜ私たちのプラットフォームが選ばれるのか
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              学習者の成功を第一に考えた、他にはない学習体験を提供します
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">体系的なカリキュラム</h3>
              <p className="text-gray-600 leading-relaxed">
                初心者から上級者まで段階的に学べるよう体系化された学習パスで効率的にスキルアップできます
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300">
                <svg className="w-10 h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">実践的なプロジェクト</h3>
              <p className="text-gray-600 leading-relaxed">
                実際の現場で使われる技術を学び、ポートフォリオに載せられる実践的なプロジェクトを完成できます
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">充実したサポート</h3>
              <p className="text-gray-600 leading-relaxed">
                質問・相談はもちろん、キャリアサポートまで。学習者一人ひとりの成功をトータルでサポートします
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA セクション - 紫色グラデーション */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 relative overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-yellow-400/15 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            今すぐ学習を始めよう
          </h2>
          <p className="text-lg md:text-xl text-purple-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            業界の最前線で活躍している講師の独自の教育で学習体験、
            それも気軽になるコースをチェックして、あなたのペースで今すぐ学習を始めましょう。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-purple-700 hover:bg-gray-100 px-10 py-4 text-lg font-semibold shadow-lg border-0" asChild>
              <Link href="/courses">
                無料コースを始める
              </Link>
            </Button>
            <Button size="lg" className="border-2 border-white text-white hover:bg-white hover:text-purple-700 px-10 py-4 text-lg font-semibold bg-transparent" asChild>
              <Link href="/dashboard">
                学習ダッシュボード
              </Link>
            </Button>
          </div>

          {/* 信頼要素 */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-purple-200">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span>無料トライアル</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>30日間返金保証</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>24/7 サポート</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// ホームページのキャッシュ設定
