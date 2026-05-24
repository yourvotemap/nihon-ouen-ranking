import { notFound } from 'next/navigation';
import ContactForm from '@/app/jp/contact/ContactForm';
import { isValidLocale, getDict, type Locale } from '@/lib/i18n';
import { isValidCountryUrl } from '@/lib/countries';

export default async function ContactPage({ params }: { params: Promise<{ locale: string; country: string }> }) {
  const { locale, country } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();
  const d = getDict(locale as Locale);

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-6">{d.contact}</h1>
      <ContactForm />
    </div>
  );
}
