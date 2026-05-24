import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const VALID_REASONS = ['誹謗中傷', '個人情報', '不適切な表現', 'スパム', 'その他'];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: '不正なリクエストです' }, { status: 400 });

  const { targetType, targetId, reason, detail } = body as {
    targetType: string; targetId: string; reason: string; detail?: string;
  };

  if (!['entity', 'support'].includes(targetType)) {
    return NextResponse.json({ error: '不正な通報タイプです' }, { status: 400 });
  }
  if (!VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: '通報理由を選択してください' }, { status: 400 });
  }

  await prisma.report.create({
    data: { targetType, targetId, reason, detail: detail ?? null, status: 'open' },
  });

  return NextResponse.json({ ok: true });
}
