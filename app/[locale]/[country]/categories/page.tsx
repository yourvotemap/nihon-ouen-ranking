import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CATEGORIES } from '@/lib/categories';
import { getDict, isValidLocale, type Locale } from '@/lib/i18n';
import { isValidCountryUrl, urlToDbCode } from '@/lib/countries';

export const revalidate = 300;

export default async function CategoriesPage({ params }: { params: Promise<{ locale: string; country: string }> }) {
  const { locale, country } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();

  const l = locale as Locale;
  const d = getDict(l);
  const countryCode = urlToDbCode(country);
  const basePath = `/${locale}/${country}`;

  const counts = await prisma.entity.groupBy({
    by: ['category'],
    where: { countryCode, status: 'active' },
    _count: { _all: true },
  });
  const countMap = Object.fromEntries(counts.map(c => [c.category, c._count._all]));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">📂 {d.category}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {CATEGORIES.map(cat => (
          <Link
            key={cat.id}
            href={`${basePath}/categories/${cat.id}`}
            className="bg-white rounded-xl p-5 text-center border border-gray-100 hover:shadow-md hover:border-red-200 transition-all"
          >
            <div className="text-3xl mb-2">{cat.emoji}</div>
            <div className="font-bold text-sm text-gray-800">{(d.categories as Record<string, string>)[cat.id] ?? cat.label}</div>
            <div className="text-xs text-gray-400 mt-1">{countMap[cat.id] ?? 0}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
