import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '投稿・応援ルール',
  description: '日本応援ランキングの投稿・応援に関するルールを説明します。',
};

export default function RulesPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-6">📋 投稿・応援ルール</h1>
      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <section className="bg-yellow-50 rounded-2xl p-5 border border-yellow-200">
          <h2 className="font-bold text-gray-900 mb-2">基本方針</h2>
          <p>このサイトは<strong>応援・称賛を目的としたサービス</strong>です。批判・告発・マイナス評価サイトではありません。</p>
        </section>
        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">禁止事項</h2>
          <ul className="space-y-2">
            {[
              '誹謗中傷・名誉毀損・侮辱的な表現',
              '根拠のない犯罪・不正の断定',
              '差別的・暴力的・性的な表現',
              '個人情報の投稿（住所・電話番号・メールアドレス等）',
              '反対運動・不買運動の呼びかけ',
              '特定の政治的主張の強制',
              'スパム・広告・宣伝目的の投稿',
              '事実に反する虚偽の情報',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 shrink-0">✗</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">ランキングについて</h2>
          <p>
            ランキングはユーザーの応援ポイントに基づくものであり、<strong>客観的な優劣や公的評価を示すものではありません</strong>。
            掲載内容は管理者判断で非表示・削除される場合があります。
          </p>
        </section>
        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">違反への対応</h2>
          <p>
            禁止事項に違反した投稿は、管理者の判断で非表示・削除されます。
            問題のある投稿を見つけた場合は、各コメントの「通報」ボタンをご利用ください。
          </p>
        </section>
        <section className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
          <h2 className="font-bold text-gray-900 text-base mb-3">応援ポイントについて</h2>
          <div className="space-y-2 text-sm">
            <p>応援ポイントはサイト内で応援に使用するためのポイントです。</p>
            <p>ポイントは現金、暗号資産、その他財産的価値への交換はできません。</p>
            <p>規約違反、不正利用、誹謗中傷投稿に使われたポイントや応援は、運営判断で無効化される場合があります。</p>
            <p>決済処理にはStripeを利用します。</p>
            <p className="text-amber-700 bg-amber-50 px-3 py-2 rounded-lg mt-2">
              ⚠️ 政党カテゴリへの有料応援はできません。政治献金に関連するご利用は禁止しています。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
