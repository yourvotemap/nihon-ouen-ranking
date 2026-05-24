import Link from 'next/link';
import { getCategoryEmoji, getCategoryLabel } from '@/lib/categories';

interface RankingCardProps {
  rank: number;
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  totalSupportPoints: number;
  supportCount: number;
  countryCode?: string;
  periodPoints?: number;
  entityBasePath?: string;
  categoryLabel?: string;
}

export default function RankingCard({
  rank, name, slug, category, shortDescription,
  totalSupportPoints, supportCount, countryCode = 'jp',
  periodPoints, entityBasePath, categoryLabel,
}: RankingCardProps) {
  const rankBadge = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
  const rankColor = rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-amber-600' : 'text-gray-500';
  const points = periodPoints !== undefined ? periodPoints : totalSupportPoints;
  const base = entityBasePath ?? `/${countryCode}/entities`;

  return (
    <Link
      href={`${base}/${slug}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-red-100 transition-all p-4"
    >
      <div className="flex items-start gap-3">
        <div className={`text-2xl font-black w-10 text-center shrink-0 ${rankColor}`}>
          {rankBadge ?? `#${rank}`}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-100">
              {getCategoryEmoji(category)} {categoryLabel ?? getCategoryLabel(category)}
            </span>
          </div>
          <div className="font-bold text-gray-900 text-base leading-tight truncate">{name}</div>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{shortDescription}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg font-black text-red-600">{points.toLocaleString()}</div>
          <div className="text-xs text-gray-400">pts</div>
          <div className="text-xs text-gray-400 mt-0.5">{supportCount}件</div>
        </div>
      </div>
    </Link>
  );
}
