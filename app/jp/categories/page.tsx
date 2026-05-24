import Link from 'next/link';
import type { Metadata } from 'next';
import { CATEGORIES } from '@/lib/categories';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'カテゴリ一覧',
  description: '人物・企業・団体・プロジェクトなどカテゴリ別にランキングを見る。',
};

export const revalidate = 300;

export default async function CategoriesPage() {
  const counts = await prisma.entity.groupBy({
    by: ['category'],
    where: { countryCode: 'JP', status: 'active' },
    _count: { _all: true },
  });
  const countMap = Object.fromEntries(counts.map(c => [c.category, c._count._all]));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">カテゴリ一覧</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {CATEGORIES.map(cat => (
          <Link
            key={cat.id}
            href={`/jp/categories/${cat.id}`}
            className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md hover:border-red-200 transition-all text-center"
          >
            <div className="text-4xl mb-2">{cat.emoji}</div>
            <div className="font-bold text-gray-900 text-sm">{cat.label}</div>
            <div className="text-xs text-gray-400 mt-1">{countMap[cat.id] ?? 0}件</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
