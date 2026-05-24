import { notFound } from 'next/navigation';
import { isValidLocale, getDict, type Locale } from '@/lib/i18n';
import { isValidCountryUrl } from '@/lib/countries';

export const revalidate = 3600;

export default async function RulesPage({ params }: { params: Promise<{ locale: string; country: string }> }) {
  const { locale, country } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();
  const d = getDict(locale as Locale);

  const prohibitedItems =
    locale === 'en'
      ? ['Defamation or personal attacks', 'Discriminatory or violent content', 'Personal information (address, phone, email)', 'Calls for boycotts or opposition movements', 'Spam or promotional posts']
      : locale === 'zh'
      ? ['诽谤或人身攻击', '歧视性或暴力内容', '个人信息（地址、电话、邮件）', '抵制呼吁', '垃圾邮件或宣传帖子']
      : ['誹謗中傷・名誉毀損・侮辱的な表現', '差別的・暴力的・性的な表現', '個人情報の投稿（住所・電話番号・メールアドレス等）', '反対運動・不買運動の呼びかけ', 'スパム・広告・宣伝目的の投稿'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-6">📋 {d.rules}</h1>
      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <ul className="space-y-2">
            {prohibitedItems.map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-red-500 shrink-0">✗</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
          <h2 className="font-bold text-gray-900 mb-2">{d.buyPoints}</h2>
          <ul className="space-y-1 text-xs">
            <li>• {d.pointsNotice1}</li>
            <li>• {d.pointsNotice2}</li>
            <li>• {d.pointsNotice3}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
