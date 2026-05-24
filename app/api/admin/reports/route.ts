import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const ct = req.headers.get('content-type') ?? '';
  const isForm = ct.includes('multipart/form-data') || ct.includes('application/x-www-form-urlencoded');

  let id: string;
  if (isForm) {
    const body = await req.formData();
    id = body.get('id') as string;
  } else {
    const body = await req.json();
    id = body.id;
  }

  if (!id) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

  await prisma.report.update({ where: { id }, data: { status: 'dismissed' } });

  if (isForm) {
    return NextResponse.redirect(new URL('/admin?tab=reports', req.url));
  }
  return NextResponse.json({ ok: true });
}
