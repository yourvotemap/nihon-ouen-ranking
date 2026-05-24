import { notFound } from 'next/navigation';
import { isValidLocale, getDict, type Locale } from '@/lib/i18n';
import { isValidCountryUrl } from '@/lib/countries';

export const revalidate = 3600;

export default async function AboutPage({ params }: { params: Promise<{ locale: string; country: string }> }) {
  const { locale, country } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();
  const d = getDict(locale as Locale);

  const bullets =
    locale === 'en'
      ? ['Positive rankings limited to support, praise, and encouragement', 'No negative rankings or downvotes', 'Defamation and discriminatory content prohibited']
      : locale === 'zh'
      ? ['仅限支持、称赞和鼓励的积极排行榜', '没有负面排行或反对投票', '禁止诽谤和歧视性内容']
      : ['応援・称賛・支援に限定したポジティブなランキング', 'ネガティブランキング・反対票は実装しない', '誹謗中傷・差別的表現は禁止'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-6">🌸 {d.about}</h1>
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <section className="bg-red-50 rounded-2xl p-6 border border-red-100">
          <h2 className="font-bold text-gray-900 text-lg mb-2">{d.siteName}</h2>
          <p className="text-sm">{d.tagline}</p>
        </section>
        <section>
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 text-sm">
            {bullets.map(b => <p key={b}>✅ {b}</p>)}
          </div>
        </section>
      </div>
    </div>
  );
}
