import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getRankings } from '@/lib/rankings';
import { FEATURED_CATEGORIES } from '@/lib/categories';
import RankingCard from '@/components/RankingCard';
import { getDict, isValidLocale, type Locale } from '@/lib/i18n';
import { isValidCountryUrl, urlToDbCode, getCountryName, getCountryFlag } from '@/lib/countries';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; country: string }> }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) return { title: '404' };
  const d = getDict(locale as Locale);
  const countryName = getCountryName(country, locale as Locale);
  return {
    title: `${d.siteName} - ${countryName}`,
    description: d.tagline,
  };
}

export default async function LocaleCountryTopPage({ params }: { params: Promise<{ locale: string; country: string }> }) {
  const { locale, country } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();

  const l = locale as Locale;
  const d = getDict(l);
  const countryCode = urlToDbCode(country);
  const flag = getCountryFlag(country);
  const countryName = getCountryName(country, l);
  const basePath = `/${locale}/${country}`;
  const topEntities = await getRankings({ countryCode, limit: 10 });

  return (
    <div>
      <section className="bg-gradient-to-br from-red-700 via-red-600 to-red-800 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4">{flag}</div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3 leading-tight">{d.siteName}</h1>
          <p className="text-sm text-red-100 mb-1 font-medium">{countryName}</p>
          <p className="text-base sm:text-lg text-red-100 mt-4 mb-8 leading-relaxed">{d.tagline}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`${basePath}/rankings`} className="bg-white text-red-700 font-bold px-8 py-3 rounded-full hover:bg-red-50 transition-colors shadow-lg">
              {d.viewRankings}
            </Link>
            <Link href={`${basePath}/categories`} className="bg-red-900/50 text-white font-bold px-8 py-3 rounded-full hover:bg-red-900/70 transition-colors border border-red-400">
              {d.findToSupport}
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">🏆 {d.overallRanking} TOP10</h2>
          <Link href={`${basePath}/rankings`} className="text-sm text-red-600 hover:text-red-800 font-medium">→</Link>
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
              entityBasePath={`${basePath}/entities`}
              categoryLabel={(d.categories as Record<string, string>)[entity.category]}
            />
          ))}
        </div>
      </section>

      <section className="bg-gray-100 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-5 text-center">{d.category}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FEATURED_CATEGORIES.map(cat => (
              <Link
                key={cat.id}
                href={`${basePath}/categories/${cat.id}`}
                className="bg-white rounded-xl p-4 text-center hover:shadow-md hover:border-red-200 border border-transparent transition-all"
              >
                <div className="text-3xl mb-2">{cat.emoji}</div>
                <div className="font-bold text-sm text-gray-800">
                  {(d.categories as Record<string, string>)[cat.id] ?? cat.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
