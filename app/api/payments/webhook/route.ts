import { NextRequest, NextResponse } from 'next/server';
import {
  fulfillCheckoutSession,
  markCheckoutFailed,
  verifyStripeWebhookSignature,
} from '@/lib/payment/stripe';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');

  try {
    if (!verifyStripeWebhookSignature(payload, signature)) {
      return NextResponse.json({ success: false, error: 'Invalid Stripe signature' }, { status: 400 });
    }

    const event = JSON.parse(payload);
    const session = event?.data?.object;

    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        if (session?.id) await fulfillCheckoutSession(session);
        break;
      case 'checkout.session.async_payment_failed':
        if (session?.id) await markCheckoutFailed(session.id, 'Stripe reported that the payment failed');
        break;
      case 'checkout.session.expired':
        if (session?.id) await markCheckoutFailed(session.id, 'Stripe Checkout Session expired', 'CANCELLED');
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
