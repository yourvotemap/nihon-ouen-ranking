import { notFound } from 'next/navigation';
import { getRankings } from '@/lib/rankings';
import RankingCard from '@/components/RankingCard';
import CategoryTabs from '@/components/CategoryTabs';
import { getDict, isValidLocale, type Locale } from '@/lib/i18n';
import { isValidCountryUrl, urlToDbCode } from '@/lib/countries';

export const revalidate = 60;

export default async function RankingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; country: string }>;
  searchParams: Promise<{ period?: string; category?: string }>;
}) {
  const { locale, country } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();

  const sp = await searchParams;
  const period = (sp.period as 'all' | 'monthly' | 'weekly') ?? 'all';
  const category = sp.category ?? 'all';
  const l = locale as Locale;
  const d = getDict(l);
  const countryCode = urlToDbCode(country);
  const basePath = `/${locale}/${country}`;

  const entities = await getRankings({
    countryCode,
    period,
    category: category === 'all' ? undefined : category,
    limit: 50,
  });

  const periodLabels: Record<string, string> = {
    all: l === 'ja' ? '総合' : l === 'en' ? 'All time' : '全部',
    monthly: l === 'ja' ? '月間' : l === 'en' ? 'Monthly' : '本月',
    weekly: l === 'ja' ? '週間' : l === 'en' ? 'Weekly' : '本周',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">🏆 {d.rankings}</h1>
      <div className="mb-4">
        <CategoryTabs
          countryCode={country}
          activeCategory={category}
          basePath={`${basePath}/rankings`}
          queryParam="category"
          extraQuery={`period=${period}`}
          allCatsHref={`${basePath}/rankings`}
          allLabel={d.overallRanking}
        />
      </div>
      <div className="flex gap-2 mb-6">
        {(['all', 'monthly', 'weekly'] as const).map(val => (
          <a
            key={val}
            href={`${basePath}/rankings?period=${val}&category=${category}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              period === val ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
            }`}
          >
            {periodLabels[val]}
          </a>
        ))}
      </div>
      <div className="space-y-3">
        {entities.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No data</p>
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
              entityBasePath={`${basePath}/entities`}
              categoryLabel={(d.categories as Record<string, string>)[e.category]}
            />
          ))
        )}
      </div>
    </div>
  );
}
