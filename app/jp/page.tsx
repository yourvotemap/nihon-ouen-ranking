import Link from 'next/link';
import type { Metadata } from 'next';
import { getRankings } from '@/lib/rankings';
import { FEATURED_CATEGORIES } from '@/lib/categories';
import RankingCard from '@/components/RankingCard';

export const metadata: Metadata = {
  title: '日本応援ランキング | My Country Support Rank',
  description: '日本を支える人・企業・団体を、応援ポイントで可視化するランキングサイト。批判ではなく応援を集めるポジティブなランキングサービスです。',
};

export const dynamic = 'force-dynamic';

export default async function JpTopPage() {
  const topEntities = await getRankings({ countryCode: 'JP', limit: 10 });

  return (
    <div>
      <section className="bg-gradient-to-br from-red-700 via-red-600 to-red-800 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4">🇯🇵</div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3 leading-tight">日本応援ランキング</h1>
          <p className="text-sm text-red-100 mb-1 font-medium tracking-widest uppercase">My Country Support Rank</p>
          <p className="text-base sm:text-lg text-red-100 mt-4 mb-8 leading-relaxed">
            日本を支える人・企業・団体を、<br className="sm:hidden" />みんなの応援で可視化する。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/jp/rankings" className="bg-white text-red-700 font-bold px-8 py-3 rounded-full hover:bg-red-50 transition-colors shadow-lg">
              ランキングを見る
            </Link>
            <Link href="/jp/categories" className="bg-red-900/50 text-white font-bold px-8 py-3 rounded-full hover:bg-red-900/70 transition-colors border border-red-400">
              応援対象を探す
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">🏆 総合ランキング TOP10</h2>
          <Link href="/jp/rankings" className="text-sm text-red-600 hover:text-red-800 font-medium">もっと見る →</Link>
        </div>
        <div className="space-y-3">
          {topEntities.map(entity => (
            <RankingCard
              key={entity.id}
              rank={entity.rank}
              name={entity.name}
              slug={entity.slug}
              category={entity.category}
              shortDescription={entity.shortDescription}
              totalSupportPoints={entity.totalSupportPoints}
              supportCount={entity.supportCount}
            />
          ))}
        </div>
      </section>

      <section className="bg-gray-100 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-5 text-center">カテゴリ別ランキング</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FEATURED_CATEGORIES.map(cat => (
              <Link
                key={cat.id}
                href={`/jp/categories/${cat.id}`}
                className="bg-white rounded-xl p-4 text-center hover:shadow-md hover:border-red-200 border border-transparent transition-all"
              >
                <div className="text-3xl mb-2">{cat.emoji}</div>
                <div className="font-bold text-sm text-gray-800">{cat.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-3">🌸 このサイトについて</h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            日本応援ランキングは、批判ではなく<strong>応援を集める</strong>ランキングです。
            日本に貢献していると思う人・会社・活動を、応援ポイントと理由で可視化します。
          </p>
          <div className="bg-white rounded-xl p-4 border border-red-100">
            <div className="text-sm font-semibold text-gray-800 mb-1">🛡️ 安全な運営方針</div>
            <p className="text-xs text-gray-600">誹謗中傷や攻撃的な投稿は禁止しています。投稿内容は必要に応じて管理者が確認・非表示にします。</p>
          </div>
          <Link href="/jp/about" className="inline-block mt-4 text-sm text-red-600 hover:text-red-800 font-medium">詳しく読む →</Link>
        </div>
      </section>
    </div>
  );
}
