'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LOCALES, type Locale } from '@/lib/i18n';
import { COUNTRIES, VALID_COUNTRY_URLS, type CountryUrlCode } from '@/lib/countries';

const LOCALE_LABELS: Record<Locale, string> = { ja: '日本語', en: 'English', zh: '中文' };

function parsePath(pathname: string): { locale: Locale; country: CountryUrlCode; rest: string } {
  const parts = pathname.split('/').filter(Boolean);
  const l = parts[0] as Locale;
  const c = parts[1] as CountryUrlCode;
  if (LOCALES.includes(l) && VALID_COUNTRY_URLS.includes(c)) {
    return { locale: l, country: c, rest: '/' + parts.slice(2).join('/') };
  }
  if (parts[0] === 'jp') {
    return { locale: 'ja', country: 'jp', rest: '/' + parts.slice(1).join('/') };
  }
  return { locale: 'ja', country: 'jp', rest: pathname };
}

function buildPath(locale: Locale, country: CountryUrlCode, rest: string, searchStr: string): string {
  const restPart = rest === '/' ? '' : rest;
  const qs = searchStr ? `?${searchStr}` : '';
  return `/${locale}/${country}${restPart}${qs}`;
}

export default function LocaleCountrySwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale, country, rest } = parsePath(pathname);
  const searchStr = searchParams.toString();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex gap-1">
        {LOCALES.map(l => (
          <Link
            key={l}
            href={buildPath(l, country, rest, searchStr)}
            className={`text-xs px-2 py-0.5 rounded border transition-colors ${
              l === locale
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'
            }`}
          >
            {LOCALE_LABELS[l]}
          </Link>
        ))}
      </div>
      <div className="flex gap-1 flex-wrap">
        {COUNTRIES.map(c => (
          <Link
            key={c.urlCode}
            href={buildPath(locale, c.urlCode, rest, searchStr)}
            className={`text-xs px-2 py-0.5 rounded border transition-colors ${
              c.urlCode === country
                ? 'bg-slate-700 text-white border-slate-700'
                : 'bg-white text-gray-600 border-gray-300 hover:border-slate-400'
            }`}
          >
            {c.flag}
          </Link>
        ))}
      </div>
    </div>
  );
}
