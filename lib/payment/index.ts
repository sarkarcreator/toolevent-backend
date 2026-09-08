import { db } from '../db/store';
import { SupportedCurrency } from '../types';

export interface CreateOrderParams {
  userId?: string;
  customerEmail: string;
  customerName?: string;
  currency: SupportedCurrency;
  productId: string;
  paymentMethod: 'TEST_MODE' | 'STRIPE' | 'PAYPAL' | 'UAE_GATEWAY';
}

export async function processCheckoutOrder(params: CreateOrderParams) {
  const product = await db.products.findUnique({ where: { id: params.productId } });
  if (!product) {
    throw new Error('Product not found');
  }

  let price = product.priceUSD;
  if (params.currency === 'AED') price = product.priceAED;
  if (params.currency === 'GBP') price = product.priceGBP;

  // In test mode or when payment secret is missing, simulate verified instant purchase
  const isTestMode = params.paymentMethod === 'TEST_MODE' || !process.env.STRIPE_SECRET_KEY;

  const order = await db.orders.create({
    data: {
      userId: params.userId,
      customerEmail: params.customerEmail,
      customerName: params.customerName || 'Valued Customer',
      currency: params.currency,
      totalAmount: price,
      status: isTestMode ? 'PAID' : 'PENDING',
      paymentProvider: params.paymentMethod,
      items: [
        {
          productId: product.id,
          name: product.name,
          price: price,
        },
      ],
    },
  });

  return {
    orderId: order.id,
    status: order.status,
    amount: order.totalAmount,
    currency: order.currency,
    downloadKey: isTestMode ? product.fileDownloadKey : null,
    downloadUrl: isTestMode ? `/api/products/download?orderId=${order.id}&key=${product.fileDownloadKey}` : null,
  };
}
