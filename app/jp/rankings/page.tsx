import type { Metadata } from 'next';
import { getRankings } from '@/lib/rankings';
import RankingCard from '@/components/RankingCard';
import CategoryTabs from '@/components/CategoryTabs';

export const metadata: Metadata = {
  title: '総合ランキング',
  description: '日本に貢献している人物・企業・団体・プロジェクトの総合ランキング。',
};

export const revalidate = 60;

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; category?: string }>;
}) {
  const params = await searchParams;
  const period = (params.period as 'all' | 'monthly' | 'weekly') ?? 'all';
  const category = params.category ?? 'all';

  const entities = await getRankings({
    countryCode: 'JP',
    period,
    category: category === 'all' ? undefined : category,
    limit: 50,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">🏆 ランキング</h1>

      <div className="mb-4">
        <CategoryTabs
          countryCode="jp"
          activeCategory={category}
          basePath="/jp/rankings"
          queryParam="category"
          extraQuery={`period=${period}`}
        />
      </div>

      <div className="flex gap-2 mb-6">
        {([['all', '総合'], ['monthly', '月間'], ['weekly', '週間']] as const).map(([val, label]) => (
          <a
            key={val}
            href={`/jp/rankings?period=${val}&category=${category}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              period === val ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="space-y-3">
        {entities.length === 0 ? (
          <p className="text-center text-gray-400 py-12">該当するランキングデータがありません</p>
        ) : (
          entities.map(e => (
            <RankingCard
              key={e.id}
              rank={e.rank}
              name={e.name}
              slug={e.slug}
              category={e.category}
              shortDescription={e.shortDescription}
              totalSupportPoints={e.totalSupportPoints}
              supportCount={e.supportCount}
              periodPoints={'periodPoints' in e ? (e.periodPoints as number) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
