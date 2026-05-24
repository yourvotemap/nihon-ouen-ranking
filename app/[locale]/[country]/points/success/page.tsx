import { notFound } from 'next/navigation';
import PointsSuccessContent from '@/components/PointsSuccessContent';
import { isValidLocale, type Locale } from '@/lib/i18n';
import { isValidCountryUrl } from '@/lib/countries';

export default async function LocalePointsSuccessPage({ params }: { params: Promise<{ locale: string; country: string }> }) {
  const { locale, country } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();
  return <PointsSuccessContent locale={locale as Locale} basePath={`/${locale}/${country}`} />;
}
