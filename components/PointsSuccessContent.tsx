import Link from 'next/link';
import { getDict, type Locale } from '@/lib/i18n';

interface Props { locale: Locale; basePath: string; }

export default function PointsSuccessContent({ locale, basePath }: Props) {
  const d = getDict(locale);
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">✅</div>
      <h1 className="text-2xl font-black text-gray-900 mb-3">{d.purchaseComplete}</h1>
      <p className="text-sm text-gray-500 mb-6">{d.webhookNote}</p>
      <div className="flex flex-col gap-3">
        <Link href={`${basePath}/points`} className="bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors">
          {d.checkBalanceLink}
        </Link>
        <Link href={`${basePath}/rankings`} className="text-sm text-gray-600 hover:text-gray-800">
          {d.backToRanking}
        </Link>
      </div>
    </div>
  );
}
