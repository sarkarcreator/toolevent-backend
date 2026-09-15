import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { processCheckoutOrder } from '@/lib/payment';
import { verifyToken } from '@/lib/auth/jwt';
import { z } from 'zod';

const orderSchema = z.object({
  productId: z.string().min(1),
  customerEmail: z.string().email(),
  customerName: z.string().optional(),
  currency: z.enum(['USD', 'AED', 'GBP']).default('USD'),
});

function getPayload(req: NextRequest) {
  let token = req.cookies.get('auth_token')?.value;
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) token = authHeader.substring(7);
  }
  return token ? verifyToken(token) : null;
}

export async function GET(req: NextRequest) {
  try {
    const payload = getPayload(req);

    if (payload?.role === 'ADMIN') {
      return NextResponse.json({ success: true, data: await db.orders.findMany({}) });
    }

    if (payload?.userId) {
      return NextResponse.json({
        success: true,
        data: await db.orders.findMany({ where: { userId: payload.userId } }),
      });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error?.message || 'Failed to load orders' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = getPayload(req);
    const body = await req.json();
    const result = orderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: result.error.issues[0]?.message || 'Invalid order parameters',
          },
        },
        { status: 400 }
      );
    }

    const checkoutResult = await processCheckoutOrder({
      userId: payload?.userId,
      customerEmail: result.data.customerEmail,
      customerName: result.data.customerName,
      currency: result.data.currency,
      productId: result.data.productId,
    });

    return NextResponse.json({ success: true, data: checkoutResult });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CHECKOUT_ERROR',
          message: error?.message || 'Failed to create Stripe Checkout Session',
        },
      },
      { status: 500 }
    );
  }
}
