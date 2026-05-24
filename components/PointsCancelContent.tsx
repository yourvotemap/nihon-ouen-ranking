import Link from 'next/link';
import { getDict, type Locale } from '@/lib/i18n';

interface Props { locale: Locale; basePath: string; }

export default function PointsCancelContent({ locale, basePath }: Props) {
  const d = getDict(locale);
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">❌</div>
      <h1 className="text-2xl font-black text-gray-900 mb-6">{d.purchaseCancelled}</h1>
      <Link href={`${basePath}/points`} className="bg-gray-100 text-gray-700 font-bold py-3 px-8 rounded-xl hover:bg-gray-200 transition-colors">
        {d.backToPoints}
      </Link>
    </div>
  );
}
