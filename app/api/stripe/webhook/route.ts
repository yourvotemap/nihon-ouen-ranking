import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const stripeSessionId = session.id;
  const email = session.customer_email ?? (session.metadata?.email ?? '');
  const pointsStr = session.metadata?.points ?? '0';
  const points = parseInt(pointsStr, 10);

  if (!email || points <= 0) {
    return NextResponse.json({ error: 'Invalid session data' }, { status: 400 });
  }

  const purchase = await prisma.pointPurchase.findUnique({ where: { stripeSessionId } });
  if (!purchase) return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });

  // Idempotency check — already paid
  if (purchase.status === 'paid') {
    return NextResponse.json({ received: true });
  }

  await prisma.$transaction(async (tx) => {
    const account = await tx.supporterAccount.upsert({
      where: { email },
      update: {
        pointBalance: { increment: points },
        totalPurchasedPoints: { increment: points },
      },
      create: {
        email,
        pointBalance: points,
        totalPurchasedPoints: points,
      },
    });

    await tx.pointPurchase.update({
      where: { id: purchase.id },
      data: {
        status: 'paid',
        paidAt: new Date(),
        supporterAccountId: account.id,
      },
    });

    await tx.pointTransaction.create({
      data: {
        supporterAccountId: account.id,
        type: 'purchase',
        points,
        balanceAfter: account.pointBalance,
        purchaseId: purchase.id,
      },
    });
  });

  return NextResponse.json({ received: true });
}
