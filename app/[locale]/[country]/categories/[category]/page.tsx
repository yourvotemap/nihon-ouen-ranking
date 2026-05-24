import { notFound } from 'next/navigation';
import { getRankings } from '@/lib/rankings';
import RankingCard from '@/components/RankingCard';
import { getCategoryEmoji } from '@/lib/categories';
import { getDict, isValidLocale, type Locale } from '@/lib/i18n';
import { isValidCountryUrl, urlToDbCode } from '@/lib/countries';

export const revalidate = 60;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; country: string; category: string }>;
}) {
  const { locale, country, category } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();

  const l = locale as Locale;
  const d = getDict(l);
  const countryCode = urlToDbCode(country);
  const basePath = `/${locale}/${country}`;
  const catLabel = (d.categories as Record<string, string>)[category] ?? category;

  const entities = await getRankings({ countryCode, category, limit: 50 });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">
        {getCategoryEmoji(category)} {catLabel}
      </h1>
      <div className="space-y-3">
        {entities.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No entries yet.</p>
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
              entityBasePath={`${basePath}/entities`}
              categoryLabel={catLabel}
            />
          ))
        )}
      </div>
    </div>
  );
}
