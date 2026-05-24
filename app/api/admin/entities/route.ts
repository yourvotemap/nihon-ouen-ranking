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

  if (!id || !['hide', 'activate'].includes(action)) {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  }

  await prisma.entity.update({
    where: { id },
    data: { status: action === 'hide' ? 'hidden' : 'active' },
  });

  if (isForm) {
    return NextResponse.redirect(new URL('/admin?tab=entities', req.url));
  }
  return NextResponse.json({ ok: true });
}
