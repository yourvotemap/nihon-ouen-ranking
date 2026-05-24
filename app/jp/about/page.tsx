import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'このサイトについて',
  description: '日本応援ランキングのサービス説明。批判ではなく応援を集めるポジティブランキングサービスです。',
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-6">🌸 このサイトについて</h1>
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <section className="bg-red-50 rounded-2xl p-6 border border-red-100">
          <h2 className="font-bold text-gray-900 text-lg mb-2">日本応援ランキングとは</h2>
          <p className="text-sm">
            日本応援ランキング（My Country Support Rank）は、日本に貢献している人物・企業・団体・プロジェクトを、
            ユーザーの応援ポイントによって可視化するランキングサービスです。
          </p>
        </section>
        <section>
          <h2 className="font-bold text-gray-900 text-lg mb-2">このサービスの目的</h2>
          <ul className="list-disc pl-4 space-y-2 text-sm">
            <li>日本の社会・文化・経済に貢献している存在を「見えるかたち」にする</li>
            <li>応援したい気持ちを「ポイント」と「言葉」で表現できる場を提供する</li>
            <li>批判・告発ではなく、ポジティブな「推し活」「応援」に特化する</li>
          </ul>
        </section>
        <section>
          <h2 className="font-bold text-gray-900 text-lg mb-2">大切にしていること</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 text-sm">
            <p>✅ 応援・称賛・支援に限定したポジティブなランキング</p>
            <p>✅ ネガティブランキング・反対票・有害評価は実装しない</p>
            <p>✅ 誹謗中傷・差別的表現は禁止し、管理者が対応</p>
            <p>✅ 実在人物・企業は中立・事実ベース・ポジティブな説明のみ</p>
          </div>
        </section>
        <section>
          <h2 className="font-bold text-gray-900 text-lg mb-2">将来のビジョン</h2>
          <p className="text-sm">
            現在は日本版のみを公開していますが、将来的には世界各国版、さらには「世界版グローバルランキング」への
            拡張を目指しています。世界中の人々が自国の誇りを称え合えるサービスを目指します。
          </p>
        </section>
      </div>
    </div>
  );
}
