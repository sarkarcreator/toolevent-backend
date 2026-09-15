import crypto from 'node:crypto';
import { prisma } from '@/lib/db/prisma';

interface StripeSession {
  id: string;
  url?: string | null;
  status?: string | null;
  payment_status?: string | null;
  payment_intent?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  metadata?: Record<string, string> | null;
  client_reference_id?: string | null;
}

function getStripeSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Stripe payments are not configured on the server');
  return key;
}

async function stripeRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getStripeSecretKey()}`,
      ...(init.body instanceof URLSearchParams ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error?.message || 'Stripe request failed');
  return data as T;
}

export async function createCheckoutSession(params: {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  productName: string;
  productDescription?: string;
  amountMinor: number;
  currency: string;
}) {
  const frontendUrl = (process.env.FRONTEND_APP_URL || process.env.FRONTEND_URL || 'https://www.toolbox.events').replace(/\/$/, '');
  const body = new URLSearchParams();
  body.set('mode', 'payment');
  body.set('success_url', `${frontendUrl}/templates?payment=success&session_id={CHECKOUT_SESSION_ID}`);
  body.set('cancel_url', `${frontendUrl}/templates?payment=cancelled&order_id=${encodeURIComponent(params.orderId)}`);
  body.set('customer_email', params.customerEmail);
  body.set('client_reference_id', params.orderId);
  body.set('metadata[orderId]', params.orderId);
  body.set('metadata[customerEmail]', params.customerEmail);
  body.set('line_items[0][price_data][currency]', params.currency.toLowerCase());
  body.set('line_items[0][price_data][unit_amount]', String(params.amountMinor));
  body.set('line_items[0][price_data][product_data][name]', params.productName);
  if (params.productDescription) body.set('line_items[0][price_data][product_data][description]', params.productDescription.slice(0, 500));
  body.set('line_items[0][quantity]', '1');
  return stripeRequest<StripeSession>('/checkout/sessions', { method: 'POST', body });
}

export async function retrieveCheckoutSession(sessionId: string) {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) throw new Error('Invalid Stripe Checkout Session ID');
  return stripeRequest<StripeSession>(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
}

export function verifyStripeWebhookSignature(payload: string, signatureHeader: string | null) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('Stripe webhook verification is not configured on the server');
  if (!signatureHeader) return false;
  const parts = signatureHeader.split(',');
  const timestampPart = parts.find((part) => part.startsWith('t='));
  const signatures = parts.filter((part) => part.startsWith('v1=')).map((part) => part.slice(3));
  const timestamp = timestampPart ? Number(timestampPart.slice(2)) : NaN;
  if (!Number.isFinite(timestamp) || signatures.length === 0) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - timestamp) > 300) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
  return signatures.some((signature) => {
    try {
      return crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(expected, 'utf8'));
    } catch {
      return false;
    }
  });
}

function createDownloadToken(orderId: string) {
  return crypto.createHmac('sha256', getStripeSecretKey()).update(`download:${orderId}`).digest('hex');
}

export function verifyDownloadToken(orderId: string, token: string) {
  const expected = createDownloadToken(orderId);
  try {
    return crypto.timingSafeEqual(Buffer.from(token, 'utf8'), Buffer.from(expected, 'utf8'));
  } catch {
    return false;
  }
}

export async function fulfillCheckoutSession(session: StripeSession) {
  const orderId = session.metadata?.orderId || session.client_reference_id;
  if (!orderId) throw new Error('Stripe session is missing the Toolbox.Events order ID');
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error('Order not found for Stripe Checkout Session');

  const expectedAmount = Math.round(order.totalAmount * 100);
  const actualAmount = session.amount_total ?? 0;
  const expectedCurrency = order.currency.toLowerCase();
  const actualCurrency = (session.currency || '').toLowerCase();
  if (actualAmount !== expectedAmount || actualCurrency !== expectedCurrency) throw new Error('Stripe payment amount or currency does not match the order');
  if (session.payment_status !== 'paid') return { orderId: order.id, status: order.status, paid: false };

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'PAID',
      paymentProvider: 'STRIPE',
      paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : order.paymentIntentId,
    },
  });

  const payment = await prisma.payment.findFirst({ where: { providerPaymentId: session.id } });
  if (payment) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'PAID', amount: order.totalAmount, currency: order.currency, errorMessage: null } });
  } else {
    await prisma.payment.create({ data: { orderId: order.id, amount: order.totalAmount, currency: order.currency, provider: 'STRIPE', providerPaymentId: session.id, status: 'PAID' } });
  }
  return { orderId: order.id, status: 'PAID', paid: true };
}

export async function getVerifiedDownload(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order || order.status !== 'PAID' || order.items.length === 0) return null;
  return {
    orderId: order.id,
    productId: order.items[0].productId,
    downloadUrl: `/api/products/download?orderId=${encodeURIComponent(order.id)}&token=${createDownloadToken(order.id)}`,
  };
}

export async function markCheckoutFailed(sessionId: string, message: string, status: 'FAILED' | 'CANCELLED' = 'FAILED') {
  const payment = await prisma.payment.findFirst({ where: { providerPaymentId: sessionId } });
  if (!payment) return;
  await prisma.payment.update({ where: { id: payment.id }, data: { status, errorMessage: message.slice(0, 500) } });
  await prisma.order.update({ where: { id: payment.orderId }, data: { status } });
}
