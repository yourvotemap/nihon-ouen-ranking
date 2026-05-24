import Link from 'next/link';
import { Suspense } from 'react';
import LocaleCountrySwitcher from './LocaleCountrySwitcher';
import type { Locale } from '@/lib/i18n';
import { getDict } from '@/lib/i18n';

interface HeaderProps {
  locale?: Locale;
  country?: string;
}

export default function Header({ locale = 'ja', country = 'jp' }: HeaderProps) {
  const d = getDict(locale);
  const basePath = locale === 'ja' && country === 'jp' ? '/jp' : `/${locale}/${country}`;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <Link href={basePath} className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🇯🇵</span>
            <div>
              <div className="font-bold text-sm text-red-700 leading-tight">{d.siteName}</div>
              <div className="text-xs text-gray-500 leading-tight hidden sm:block">{d.siteSubtitle}</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link href={`${basePath}/rankings`} className="text-gray-600 hover:text-red-700 transition-colors">{d.rankings}</Link>
            <Link href={`${basePath}/categories`} className="text-gray-600 hover:text-red-700 transition-colors">{d.category}</Link>
            <Link href={`${basePath}/points`} className="text-red-600 hover:text-red-800 font-medium transition-colors">{d.buyPoints}</Link>
          </nav>
          <Suspense fallback={null}>
            <LocaleCountrySwitcher />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
