import { prisma } from './prisma';

export type RankingPeriod = 'all' | 'monthly' | 'weekly';

function getPeriodStart(period: RankingPeriod): Date | null {
  if (period === 'all') return null;
  const d = new Date();
  if (period === 'monthly') d.setMonth(d.getMonth() - 1);
  if (period === 'weekly') d.setDate(d.getDate() - 7);
  return d;
}

export async function getRankings({
  countryCode = 'JP',
  category,
  period = 'all',
  limit = 20,
  skip = 0,
}: {
  countryCode?: string;
  category?: string;
  period?: RankingPeriod;
  limit?: number;
  skip?: number;
}) {
  const periodStart = getPeriodStart(period);

  if (periodStart) {
    const grouped = await prisma.support.groupBy({
      by: ['entityId'],
      where: {
        createdAt: { gte: periodStart },
        status: 'visible',
        entity: {
          countryCode,
          status: 'active',
          ...(category && category !== 'all' ? { category } : {}),
        },
      },
      _sum: { points: true },
      _count: { _all: true },
      orderBy: { _sum: { points: 'desc' } },
      take: limit,
      skip,
    });

    const entities = await prisma.entity.findMany({
      where: { id: { in: grouped.map(g => g.entityId) } },
    });

    return grouped.map((g, i) => {
      const e = entities.find(ent => ent.id === g.entityId)!;
      return {
        ...e,
        tags: JSON.parse(e.tags) as string[],
        periodPoints: g._sum.points ?? 0,
        rank: skip + i + 1,
      };
    });
  }

  const entities = await prisma.entity.findMany({
    where: {
      countryCode,
      status: 'active',
      ...(category && category !== 'all' ? { category } : {}),
    },
    orderBy: { totalSupportPoints: 'desc' },
    take: limit,
    skip,
  });

  return entities.map((e, i) => ({
    ...e,
    tags: JSON.parse(e.tags) as string[],
    rank: skip + i + 1,
  }));
}

export async function getEntityBySlug(countryCode: string, slug: string) {
  const entity = await prisma.entity.findUnique({
    where: { countryCode_slug: { countryCode, slug } },
  });
  if (!entity) return null;
  return { ...entity, tags: JSON.parse(entity.tags) as string[] };
}

export async function getEntityRank(entityId: string, countryCode: string): Promise<number> {
  const entity = await prisma.entity.findUnique({ where: { id: entityId } });
  if (!entity) return 0;
  const count = await prisma.entity.count({
    where: {
      countryCode,
      status: 'active',
      totalSupportPoints: { gt: entity.totalSupportPoints },
    },
  });
  return count + 1;
}
