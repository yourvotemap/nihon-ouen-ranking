import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRankings } from '@/lib/rankings';
import { getCategoryLabel, getCategoryEmoji, CATEGORIES } from '@/lib/categories';
import RankingCard from '@/components/RankingCard';

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const label = getCategoryLabel(category);
  return {
    title: `${label}ランキング`,
    description: `日本の${label}を応援ポイントでランキング表示。`,
  };
}

export const revalidate = 60;

export default async function CategoryRankingPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const validIds = CATEGORIES.map(c => c.id as string);
  if (!validIds.includes(category)) notFound();

  const entities = await getRankings({ countryCode: 'JP', category, limit: 50 });
  const label = getCategoryLabel(category);
  const emoji = getCategoryEmoji(category);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-3xl">{emoji}</span>
        <h1 className="text-2xl font-black text-gray-900">{label}ランキング</h1>
      </div>
      <div className="space-y-3">
        {entities.length === 0 ? (
          <p className="text-center text-gray-400 py-12">このカテゴリにはまだ掲載がありません</p>
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
            />
          ))
        )}
      </div>
    </div>
  );
}
