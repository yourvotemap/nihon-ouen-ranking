import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { isValidLocale, type Locale } from '@/lib/i18n';
import { isValidCountryUrl } from '@/lib/countries';

export default async function LocaleCountryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; country: string }>;
}) {
  const { locale, country } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();

  return (
    <>
      <Header locale={locale as Locale} country={country} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
