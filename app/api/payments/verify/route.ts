import { NextRequest, NextResponse } from 'next/server';
import { fulfillCheckoutSession, getVerifiedDownload, retrieveCheckoutSession } from '@/lib/payment/stripe';
import { z } from 'zod';

export const runtime = 'nodejs';

const schema = z.object({ sessionId: z.string().min(10) });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid Stripe Checkout Session ID' } },
        { status: 400 }
      );
    }

    const session = await retrieveCheckoutSession(result.data.sessionId);
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, error: { code: 'PAYMENT_NOT_COMPLETED', message: 'The Stripe payment has not been completed.' } },
        { status: 409 }
      );
    }

    const fulfillment = await fulfillCheckoutSession(session);
    if (!fulfillment.paid) {
      return NextResponse.json(
        { success: false, error: { code: 'PAYMENT_NOT_COMPLETED', message: 'The payment could not be verified.' } },
        { status: 409 }
      );
    }

    const download = await getVerifiedDownload(fulfillment.orderId);
    if (!download) throw new Error('Paid order could not be prepared for download');

    return NextResponse.json({
      success: true,
      data: {
        orderId: fulfillment.orderId,
        status: 'PAID',
        downloadUrl: download.downloadUrl,
        productId: download.productId,
      },
    });
  } catch (error: any) {
    console.error('Stripe payment verification error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'PAYMENT_VERIFICATION_ERROR', message: error?.message || 'Unable to verify payment' } },
      { status: 400 }
    );
  }
}
