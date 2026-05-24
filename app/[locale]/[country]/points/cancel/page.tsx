import { notFound } from 'next/navigation';
import PointsCancelContent from '@/components/PointsCancelContent';
import { isValidLocale, type Locale } from '@/lib/i18n';
import { isValidCountryUrl } from '@/lib/countries';

export default async function LocalePointsCancelPage({ params }: { params: Promise<{ locale: string; country: string }> }) {
  const { locale, country } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();
  return <PointsCancelContent locale={locale as Locale} basePath={`/${locale}/${country}`} />;
}
