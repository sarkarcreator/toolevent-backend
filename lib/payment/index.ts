import { db } from '../db/store';
import { SupportedCurrency } from '../types';
import { prisma } from '@/lib/db/prisma';
import { createCheckoutSession } from './stripe';

export interface CreateOrderParams {
  userId?: string;
  customerEmail: string;
  customerName?: string;
  currency: SupportedCurrency;
  productId: string;
}

export async function processCheckoutOrder(params: CreateOrderParams) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Online payments are temporarily unavailable because Stripe is not configured');
  }

  const product = await db.products.findUnique({ where: { id: params.productId } });
  if (!product || !product.isActive) {
    throw new Error('Product not found');
  }

  let price = product.priceUSD;
  if (params.currency === 'AED') price = product.priceAED;
  if (params.currency === 'GBP') price = product.priceGBP;

  const amountMinor = Math.round(price * 100);
  if (!Number.isSafeInteger(amountMinor) || amountMinor < 1) {
    throw new Error('Invalid product price');
  }

  const order = await db.orders.create({
    data: {
      userId: params.userId,
      customerEmail: params.customerEmail,
      customerName: params.customerName || 'Valued Customer',
      currency: params.currency,
      totalAmount: price,
      status: 'PENDING',
      paymentProvider: 'STRIPE',
      items: [
        {
          productId: product.id,
          name: product.name,
          price,
        },
      ],
    },
  });

  try {
    const session = await createCheckoutSession({
      orderId: order.id,
      customerEmail: params.customerEmail,
      customerName: params.customerName,
      productName: product.name,
      productDescription: product.description,
      amountMinor,
      currency: params.currency,
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: price,
        currency: params.currency,
        provider: 'STRIPE',
        providerPaymentId: session.id,
        status: 'PENDING',
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentProvider: 'STRIPE' },
    });

    if (!session.url) {
      throw new Error('Stripe did not return a Checkout URL');
    }

    return {
      orderId: order.id,
      status: 'PENDING',
      amount: price,
      currency: params.currency,
      checkoutUrl: session.url,
    };
  } catch (error) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'FAILED' },
    }).catch(() => undefined);
    throw error;
  }
}
