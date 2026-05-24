import { notFound } from 'next/navigation';
import PointsPageContent from '@/components/PointsPageContent';
import { isValidLocale, type Locale } from '@/lib/i18n';
import { isValidCountryUrl } from '@/lib/countries';

export default async function LocalePointsPage({ params }: { params: Promise<{ locale: string; country: string }> }) {
  const { locale, country } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();
  return <PointsPageContent locale={locale as Locale} country={country} basePath={`/${locale}/${country}`} />;
}
