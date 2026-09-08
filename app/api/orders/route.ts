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
  paymentMethod: z.enum(['TEST_MODE', 'STRIPE', 'PAYPAL', 'UAE_GATEWAY']).default('TEST_MODE'),
});

export async function GET(req: NextRequest) {
  try {
    let token = req.cookies.get('auth_token')?.value;
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    const payload = token ? verifyToken(token) : null;
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || undefined;

    let orders;
    if (payload?.role === 'ADMIN') {
      orders = await db.orders.findMany({});
    } else if (payload?.userId) {
      orders = await db.orders.findMany({ where: { userId: payload.userId } });
    } else if (email) {
      orders = await db.orders.findMany({ where: { customerEmail: email } });
    } else {
      return NextResponse.json({ success: true, data: [] });
    }

    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error?.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let token = req.cookies.get('auth_token')?.value;
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    const payload = token ? verifyToken(token) : null;
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
      paymentMethod: result.data.paymentMethod,
    });

    return NextResponse.json({
      success: true,
      data: checkoutResult,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CHECKOUT_ERROR',
          message: error?.message || 'Failed to process order',
        },
      },
      { status: 500 }
    );
  }
}
