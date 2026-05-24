import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const ct = req.headers.get('content-type') ?? '';
  const isForm = ct.includes('multipart/form-data') || ct.includes('application/x-www-form-urlencoded');

  let id: string, action: string;
  if (isForm) {
    const body = await req.formData();
    id = body.get('id') as string;
    action = body.get('action') as string;
  } else {
    const body = await req.json();
    id = body.id;
    action = body.action;
  }

  if (!id || action !== 'hide') {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  }

  const support = await prisma.support.findUnique({ where: { id } });
  if (!support) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.$transaction([
    prisma.support.update({ where: { id }, data: { status: 'hidden' } }),
    prisma.entity.update({
      where: { id: support.entityId },
      data: {
        totalSupportPoints: { decrement: support.points },
        supportCount: { decrement: 1 },
      },
    }),
  ]);

  if (isForm) {
    return NextResponse.redirect(new URL('/admin?tab=supports', req.url));
  }
  return NextResponse.json({ ok: true });
}
