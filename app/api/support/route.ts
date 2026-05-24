// app/api/support/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { validateSupport } from '@/lib/validation';

const RATE_LIMIT_MINUTES = 30;
const FREE_DAILY_MAX_POINTS = 10;

function hashIp(ip: string): string {
  return createHash('sha256').update(ip + (process.env.ADMIN_PASSWORD ?? '')).digest('hex').slice(0, 16);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
  const ipHash = hashIp(ip);

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: '不正なリクエストです' }, { status: 400 });

  const validation = validateSupport(body);
  if (!validation.valid) return NextResponse.json({ error: validation.error }, { status: 400 });

  const { entityId, points, supporterName, comment, paymentType, email } = body as {
    entityId: string;
    points: number;
    supporterName?: string;
    comment: string;
    paymentType?: 'free' | 'paid';
    email?: string;
  };

  const mode = paymentType === 'paid' ? 'paid' : 'free';

  const entity = await prisma.entity.findUnique({ where: { id: entityId } });
  if (!entity || entity.status !== 'active') {
    return NextResponse.json({ error: '対象が見つかりません' }, { status: 404 });
  }

  // political_party: paid support forbidden
  if (entity.category === 'political_party' && mode === 'paid') {
    return NextResponse.json({ error: '政党への有料応援はできません。無料応援をご利用ください。' }, { status: 400 });
  }

  if (mode === 'free') {
    if (points > FREE_DAILY_MAX_POINTS) {
      return NextResponse.json({ error: `無料応援は${FREE_DAILY_MAX_POINTS}ptまでです` }, { status: 400 });
    }

    const since = new Date(Date.now() - RATE_LIMIT_MINUTES * 60 * 1000);
    const recentCount = await prisma.rateLimitRecord.count({
      where: { ipHash, entityId, createdAt: { gte: since } },
    });
    if (recentCount >= 3) {
      return NextResponse.json({ error: `同じ対象への応援は${RATE_LIMIT_MINUTES}分間に3回までです` }, { status: 429 });
    }

    // 1-day free support check
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const todayFreeCount = await prisma.freeSupportRecord.count({
      where: { ipHash, entityId, createdAt: { gte: dayStart } },
    });
    if (todayFreeCount >= 1) {
      return NextResponse.json({ error: '同じ対象への無料応援は1日1回までです' }, { status: 429 });
    }

    await prisma.$transaction([
      prisma.support.create({
        data: {
          entityId, countryCode: entity.countryCode,
          supporterName: supporterName || null,
          email: email || null,
          paymentType: 'free',
          points, comment, ipHash, status: 'visible',
        },
      }),
      prisma.entity.update({
        where: { id: entityId },
        data: { totalSupportPoints: { increment: points }, supportCount: { increment: 1 } },
      }),
      prisma.rateLimitRecord.create({ data: { ipHash, entityId } }),
      prisma.freeSupportRecord.create({ data: { ipHash, entityId } }),
    ]);

    return NextResponse.json({ ok: true });
  }

  // paid mode
  if (!email) return NextResponse.json({ error: 'メールアドレスが必要です' }, { status: 400 });

  const account = await prisma.supporterAccount.findUnique({ where: { email } });
  if (!account) return NextResponse.json({ error: 'アカウントが見つかりません。先にポイントを購入してください。' }, { status: 400 });
  if (account.pointBalance < points) {
    return NextResponse.json({ error: `残高が不足しています（残高: ${account.pointBalance}pt）` }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    const support = await tx.support.create({
      data: {
        entityId, countryCode: entity.countryCode,
        supporterName: supporterName || null,
        email,
        paymentType: 'paid',
        supporterAccountId: account.id,
        points, comment, ipHash, status: 'visible',
      },
    });

    const updatedAccount = await tx.supporterAccount.update({
      where: { id: account.id },
      data: {
        pointBalance: { decrement: points },
        totalSpentPoints: { increment: points },
      },
    });

    await tx.pointTransaction.create({
      data: {
        supporterAccountId: account.id,
        type: 'support',
        points: -points,
        balanceAfter: updatedAccount.pointBalance,
        entityId,
        supportId: support.id,
      },
    });

    await tx.entity.update({
      where: { id: entityId },
      data: { totalSupportPoints: { increment: points }, supportCount: { increment: 1 } },
    });
  });

  return NextResponse.json({ ok: true });
}
