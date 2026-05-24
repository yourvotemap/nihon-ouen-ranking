import Link from 'next/link';
import { CATEGORIES, FEATURED_CATEGORIES } from '@/lib/categories';

interface CategoryTabsProps {
  countryCode?: string;
  showAll?: boolean;
  activeCategory?: string;
  basePath?: string;
  queryParam?: string;
  extraQuery?: string;
  allCatsHref?: string;
  allLabel?: string;
}

export default function CategoryTabs({
  countryCode = 'jp',
  showAll = false,
  activeCategory = 'all',
  basePath,
  queryParam,
  extraQuery = '',
  allCatsHref,
  allLabel = 'すべて',
}: CategoryTabsProps) {
  const cats = showAll ? CATEGORIES : FEATURED_CATEGORIES;
  const base = basePath ?? `/${countryCode}/categories`;

  function buildHref(id: string) {
    if (queryParam) {
      const params = new URLSearchParams({ [queryParam]: id });
      if (extraQuery) {
        const [k, v] = extraQuery.split('=');
        if (k && v) params.set(k, v);
      }
      return `${base}?${params.toString()}`;
    }
    if (id === 'all') return allCatsHref ?? `/${countryCode}/rankings`;
    return `${base}/${id}`;
  }

  const resolvedAllHref = queryParam ? buildHref('all') : (allCatsHref ?? `/${countryCode}/rankings`);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Link
        href={resolvedAllHref}
        className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          activeCategory === 'all'
            ? 'bg-red-600 text-white'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
        }`}
      >
        {allLabel}
      </Link>
      {cats.map(cat => (
        <Link
          key={cat.id}
          href={buildHref(cat.id)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeCategory === cat.id
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
          }`}
        >
          {cat.emoji} {cat.label}
        </Link>
      ))}
    </div>
  );
}
