import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getPlanById } from '@/lib/pointPlans';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ notReady: true, error: 'Stripe not configured' }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: '不正なリクエスト' }, { status: 400 });

  const { email, planId, successUrl, cancelUrl } = body as {
    email?: string; planId?: string; successUrl?: string; cancelUrl?: string;
  };

  if (!email || !planId || !successUrl || !cancelUrl) {
    return NextResponse.json({ error: 'パラメータが不足しています' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'メールアドレスの形式が正しくありません' }, { status: 400 });
  }

  const plan = getPlanById(planId);
  if (!plan) return NextResponse.json({ error: '無効なプランです' }, { status: 400 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: email,
    line_items: [{
      price_data: {
        currency: plan.currency,
        product_data: { name: `応援ポイント ${plan.points.toLocaleString()}pt` },
        unit_amount: plan.amount,
      },
      quantity: 1,
    }],
    success_url: `${siteUrl}${successUrl}`,
    cancel_url: `${siteUrl}${cancelUrl}`,
    metadata: { email, planId, points: String(plan.points) },
  });

  await prisma.pointPurchase.create({
    data: {
      stripeSessionId: session.id,
      email,
      points: plan.points,
      amount: plan.amount,
      currency: plan.currency,
      status: 'pending',
    },
  });

  return NextResponse.json({ url: session.url });
}
