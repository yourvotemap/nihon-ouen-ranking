import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const account = await prisma.supporterAccount.findUnique({ where: { email } });
  if (!account) {
    return NextResponse.json({ email, pointBalance: 0, totalPurchasedPoints: 0, totalSpentPoints: 0 });
  }

  return NextResponse.json({
    email: account.email,
    pointBalance: account.pointBalance,
    totalPurchasedPoints: account.totalPurchasedPoints,
    totalSpentPoints: account.totalSpentPoints,
  });
}
