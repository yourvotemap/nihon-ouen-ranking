import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEntityBySlug, getEntityRank } from '@/lib/rankings';
import { getCategoryLabel, getCategoryEmoji } from '@/lib/categories';
import { prisma } from '@/lib/prisma';
import SupportForm from '@/components/SupportForm';
import CommentList from '@/components/CommentList';
import ReportButton from '@/components/ReportButton';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entity = await getEntityBySlug('JP', slug);
  if (!entity) return { title: '404' };
  return {
    title: `${entity.name}を応援する`,
    description: `${entity.name}への応援ポイント・応援理由を掲載。日本に貢献する${getCategoryLabel(entity.category)}をみんなで応援するランキングサイト。`,
    openGraph: {
      title: `${entity.name}を応援する | 日本応援ランキング`,
      description: entity.shortDescription,
    },
  };
}

export const revalidate = 60;

export default async function EntityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entity = await getEntityBySlug('JP', slug);
  if (!entity || entity.status !== 'active') notFound();

  const rank = await getEntityRank(entity.id, 'JP');
  const supports = await prisma.support.findMany({
    where: { entityId: entity.id, status: 'visible' },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: entity.name,
    description: entity.description,
    ...(entity.officialUrl ? { url: entity.officialUrl } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-100">
                  {getCategoryEmoji(entity.category)} {getCategoryLabel(entity.category)}
                </span>
                <span className="text-xs text-gray-400">ランキング #{rank}</span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-1">{entity.name}</h1>
              <p className="text-sm text-gray-500">{entity.shortDescription}</p>
            </div>
            <ReportButton targetType="entity" targetId={entity.id} />
          </div>

          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-black text-red-600">{entity.totalSupportPoints.toLocaleString()}</div>
              <div className="text-xs text-gray-500">応援ポイント</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-gray-700">{entity.supportCount}</div>
              <div className="text-xs text-gray-500">応援件数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-gray-700">#{rank}</div>
              <div className="text-xs text-gray-500">順位</div>
            </div>
          </div>

          {entity.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {entity.tags.map((tag: string) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-3">このエントリーについて</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{entity.description}</p>
          {entity.officialUrl && (
            <a
              href={entity.officialUrl}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 hover:text-blue-800"
            >
              🔗 公式サイト
            </a>
          )}
        </div>

        <div className="mb-6">
          <SupportForm entityId={entity.id} entityName={entity.name} category={entity.category} locale="ja" />
        </div>

        <div>
          <h2 className="font-bold text-gray-900 mb-4">💬 応援コメント（{supports.length}件）</h2>
          <CommentList comments={supports} />
        </div>
      </div>
    </>
  );
}
