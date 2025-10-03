export const metadata = {
  title: '利用規約 | HiroCodeオンライン講座',
  description: 'サービスの利用条件について'
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          {/* ヘッダー */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            利用規約
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            最終更新日: 2024年1月1日
          </p>

          {/* 本文 */}
          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                第1条（適用）
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-600">
                <li>
                  本規約は、HiroCodeオンライン講座（以下「当サービス」）の提供条件及び当サービスの利用に関する当社とユーザーとの間の権利義務関係を定めることを目的とし、ユーザーと当社との間の当サービスの利用に関わる一切の関係に適用されます。
                </li>
                <li>
                  当社が当サービス上で掲載する利用規約以外のルールは、本規約の一部を構成するものとします。
                </li>
                <li>
                  本規約の内容と、前項のルールその他本規約外の説明等とが異なる場合は、本規約の規定が優先して適用されるものとします。
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                第2条（利用登録）
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-600">
                <li>
                  当サービスの利用を希望する者は、本規約に同意の上、当社の定める方法によって利用登録を申請するものとします。
                </li>
                <li>
                  当社は、利用登録の申請者が以下の事由のいずれかに該当する場合、利用登録の申請を承認しないことがあります。
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>利用登録の申請に際して虚偽の事項を届け出た場合</li>
                    <li>本規約に違反したことがある者からの申請である場合</li>
                    <li>その他、当社が利用登録を相当でないと判断した場合</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                第3条（ユーザーIDおよびパスワードの管理）
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-600">
                <li>
                  ユーザーは、自己の責任において、当サービスに関するユーザーIDおよびパスワード（Google認証情報を含む）を適切に管理および保管するものとし、これを第三者に利用させ、または貸与、譲渡、名義変更、売買等をしてはならないものとします。
                </li>
                <li>
                  ユーザーIDまたはパスワードの管理不十分、使用上の過誤、第三者の使用等によって生じた損害に関する責任はユーザーが負うものとします。
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                第4条（禁止事項）
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                ユーザーは、当サービスの利用にあたり、以下の行為をしてはなりません。
              </p>
              <ol className="list-decimal list-inside space-y-3 text-gray-600">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>当社、当サービスの他のユーザー、または第三者の知的財産権を侵害する行為</li>
                <li>当社、当サービスの他のユーザー、または第三者の名誉、信用、プライバシー等を侵害する行為</li>
                <li>当サービスのネットワークまたはシステム等に過度な負荷をかける行為</li>
                <li>当社のサーバーやネットワークシステムに不正にアクセスし、または不正なアクセスを試みる行為</li>
                <li>第三者に成りすます行為</li>
                <li>当サービスの他のユーザーのIDまたはパスワードを利用する行為</li>
                <li>当サービスの講座コンテンツを無断で複製、配布、転載する行為</li>
                <li>当サービスの運営を妨害するおそれのある行為</li>
                <li>その他、当社が不適切と判断する行為</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                第5条（当サービスの提供の停止等）
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-600">
                <li>
                  当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく当サービスの全部または一部の提供を停止または中断することができるものとします。
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>当サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                    <li>地震、落雷、火災、停電または天災などの不可抗力により、当サービスの提供が困難となった場合</li>
                    <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                    <li>その他、当社が当サービスの提供が困難と判断した場合</li>
                  </ul>
                </li>
                <li>
                  当社は、当サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                第6条（著作権）
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-600">
                <li>
                  当サービス上で提供されるすべてのコンテンツ（テキスト、画像、動画、音声等）の著作権は、当社または当該コンテンツを創作した第三者に帰属します。
                </li>
                <li>
                  ユーザーは、当社の事前の書面による許可なく、当サービスのコンテンツを複製、転載、配布、公衆送信、改変等することはできません。
                </li>
                <li>
                  ユーザーは、当サービスを通じて取得したコンテンツを、個人的な学習目的の範囲内でのみ利用することができます。
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                第7条（利用制限および登録抹消）
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-600">
                <li>
                  当社は、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、ユーザーに対して、当サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします。
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>本規約のいずれかの条項に違反した場合</li>
                    <li>登録事項に虚偽の事実があることが判明した場合</li>
                    <li>その他、当社が当サービスの利用を適当でないと判断した場合</li>
                  </ul>
                </li>
                <li>
                  当社は、本条に基づき当社が行った行為によりユーザーに生じた損害について、一切の責任を負いません。
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                第8条（退会）
              </h2>
              <p className="text-gray-600 leading-relaxed">
                ユーザーは、当社の定める手続により、いつでも当サービスから退会できるものとします。退会後のデータの復元はできませんので、ご了承ください。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                第9条（保証の否認および免責事項）
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-600">
                <li>
                  当社は、当サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
                </li>
                <li>
                  当社は、当サービスに起因してユーザーに生じたあらゆる損害について、当社の故意または重過失による場合を除き、一切の責任を負いません。
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                第10条（サービス内容の変更等）
              </h2>
              <p className="text-gray-600 leading-relaxed">
                当社は、ユーザーへの事前の告知をもって、当サービスの内容を変更、追加または廃止することがあり、ユーザーはこれを承諾するものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                第11条（利用規約の変更）
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-600">
                <li>
                  当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
                </li>
                <li>
                  変更後の本規約は、当サービス上に表示した時点より効力を生じるものとします。
                </li>
                <li>
                  本規約の変更後、当サービスの利用を開始した場合には、変更後の規約に同意したものとみなします。
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                第12条（個人情報の取扱い）
              </h2>
              <p className="text-gray-600 leading-relaxed">
                当社は、当サービスの利用によって取得する個人情報については、当社のプライバシーポリシーに従い適切に取り扱うものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                第13条（準拠法・裁判管轄）
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-600">
                <li>
                  本規約の解釈にあたっては、日本法を準拠法とします。
                </li>
                <li>
                  当サービスに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                お問い合わせ
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                本規約に関するご質問やご意見は、以下の連絡先までお問い合わせください。
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

            <div className="text-right text-sm text-gray-500 mt-12">
              以上
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
