export const metadata = {
  title: 'プライバシーポリシー | HiroCodeオンライン講座',
  description: '個人情報の取り扱いについて'
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          {/* ヘッダー */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            プライバシーポリシー
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            最終更新日: 2024年1月1日
          </p>

          {/* 本文 */}
          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. 個人情報の収集
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                HiroCodeオンライン講座（以下「当サービス」）では、ユーザーの皆様に最適なサービスを提供するため、以下の個人情報を収集します。
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>お名前</li>
                <li>メールアドレス</li>
                <li>Googleアカウント情報（認証時）</li>
                <li>プロフィール画像</li>
                <li>学習履歴・進捗データ</li>
                <li>アクセスログ</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. 個人情報の利用目的
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                収集した個人情報は、以下の目的で利用します。
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>ユーザー認証とアカウント管理</li>
                <li>講座コンテンツの提供</li>
                <li>学習進捗の記録と管理</li>
                <li>サービスの改善と最適化</li>
                <li>お問い合わせへの対応</li>
                <li>重要なお知らせの通知</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. 個人情報の第三者提供
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                当サービスは、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>ユーザーの同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要がある場合</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Cookie（クッキー）の使用
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                当サービスでは、ユーザー体験の向上のためにCookieを使用しています。Cookieは以下の目的で使用されます。
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>ログイン状態の維持</li>
                <li>サイトの利用状況の分析</li>
                <li>ユーザー設定の保存</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                ブラウザの設定でCookieを無効にすることができますが、一部の機能が正常に動作しない場合があります。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. セキュリティ
              </h2>
              <p className="text-gray-600 leading-relaxed">
                当サービスは、個人情報の漏洩、滅失または毀損を防止するため、適切なセキュリティ対策を実施しています。SSL/TLS暗号化通信の採用、アクセス制限、定期的なセキュリティ監査などを行っています。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. 個人情報の開示・訂正・削除
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                ユーザーは、自身の個人情報について、以下の権利を有します。
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>個人情報の開示を求める権利</li>
                <li>個人情報の訂正を求める権利</li>
                <li>個人情報の削除を求める権利</li>
                <li>個人情報の利用停止を求める権利</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                これらの権利を行使される場合は、お問い合わせページよりご連絡ください。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Google OAuth認証について
              </h2>
              <p className="text-gray-600 leading-relaxed">
                当サービスでは、Google OAuth 2.0を使用した認証を採用しています。Google認証を通じて取得する情報は、Googleのプライバシーポリシーに基づいて管理されます。当サービスは、必要最小限の情報（メールアドレス、プロフィール情報）のみを取得し、適切に管理します。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. プライバシーポリシーの変更
              </h2>
              <p className="text-gray-600 leading-relaxed">
                当サービスは、法令の変更やサービス内容の変更に伴い、本プライバシーポリシーを変更することがあります。重要な変更がある場合は、サイト上で通知いたします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. お問い合わせ
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                本プライバシーポリシーに関するご質問やご意見は、以下の連絡先までお問い合わせください。
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="text-gray-900 font-medium mb-2">
                  HiroCodeオンライン講座 運営事務局
                </p>
                <p className="text-gray-600">
                  メール: support@hirocode.com
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
