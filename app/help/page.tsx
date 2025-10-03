import Link from 'next/link'

export const metadata = {
  title: 'ヘルプセンター | HiroCodeオンライン講座',
  description: 'よくある質問と使い方ガイド'
}

export default function HelpPage() {
  const faqs = [
    {
      category: '講座について',
      questions: [
        {
          q: '講座はどのように受講できますか？',
          a: '会員登録後、講座一覧から受講したい講座を選択し、各レッスンの動画を視聴できます。最初のレッスンは無料で視聴可能です。'
        },
        {
          q: '進捗状況はどこで確認できますか？',
          a: 'ダッシュボードページで、受講中の講座の進捗状況や完了したレッスン数を確認できます。'
        },
        {
          q: '動画は何度でも視聴できますか？',
          a: 'はい、すべての動画は何度でも繰り返し視聴できます。学習ペースに合わせて自由に学習を進められます。'
        }
      ]
    },
    {
      category: 'アカウント',
      questions: [
        {
          q: 'アカウントの登録方法は？',
          a: 'Googleアカウントを使用して簡単に登録できます。ログインページから「Googleでログイン」ボタンをクリックしてください。'
        },
        {
          q: 'パスワードを忘れた場合はどうすればよいですか？',
          a: '当サイトではGoogle認証を使用しているため、パスワードの管理は不要です。Googleアカウントでログインしてください。'
        },
        {
          q: 'アカウントを削除したい',
          a: 'お問い合わせページからアカウント削除のご依頼をお送りください。対応させていただきます。'
        }
      ]
    },
    {
      category: '技術的な問題',
      questions: [
        {
          q: '動画が再生されません',
          a: 'インターネット接続を確認し、ブラウザをリロードしてください。問題が続く場合はお問い合わせください。'
        },
        {
          q: '推奨ブラウザは何ですか？',
          a: 'Chrome、Firefox、Safari、Edgeの最新版を推奨しています。'
        },
        {
          q: 'モバイルでも利用できますか？',
          a: 'はい、スマートフォンやタブレットでも快適にご利用いただけます。'
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ヘルプセンター
          </h1>
          <p className="text-lg text-gray-600">
            よくある質問と使い方ガイド
          </p>
        </div>

        {/* 検索ボックス */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-3">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="質問を検索..."
              className="flex-1 border-none focus:ring-0 text-gray-900"
              disabled
            />
          </div>
        </div>

        {/* FAQ カテゴリ */}
        {faqs.map((category, idx) => (
          <div key={idx} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {category.category}
            </h2>
            <div className="space-y-4">
              {category.questions.map((item, qIdx) => (
                <div key={qIdx} className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Q: {item.q}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    A: {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* お問い合わせへの誘導 */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-8 text-center mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            問題が解決しませんでしたか？
          </h3>
          <p className="text-gray-600 mb-6">
            お気軽にお問い合わせください。サポートチームが対応いたします。
          </p>
          <Link
            href="/contact"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            お問い合わせ
          </Link>
        </div>
      </div>
    </div>
  )
}
