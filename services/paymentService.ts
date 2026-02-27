/**
 * paymentService — owns all Razorpay interaction.
 *
 * Security contract:
 *   - NEVER marks an order paid without server-side HMAC-SHA256 signature verification.
 *   - Webhook verification uses a separate RAZORPAY_WEBHOOK_SECRET.
 *   - timingSafeEqual used for all signature comparisons to prevent timing attacks.
 */

import Razorpay from 'razorpay';
import crypto from 'node:crypto';
import type { RowDataPacket } from 'mysql2/promise';
import pool from '@/lib/db';
import { AppError } from '@/lib/errors';
import { updateOrderPayment } from '@/services/orderService';
import type { PaymentStatus } from '@/types';

// ─── Razorpay client (lazy — not instantiated at module load / build time) ────

let _rzp: Razorpay | null = null;

function getRzp(): Razorpay {
  if (!_rzp) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) throw new AppError('Razorpay is not configured', 500);
    _rzp = new Razorpay({ key_id, key_secret });
  }
  return _rzp;
}

// ─── DB Row Type ──────────────────────────────────────────────────────────────

interface OrderRow extends RowDataPacket {
  id: number;
  user_id: number;
  total: string; // DECIMAL as string
  payment_status: PaymentStatus;
  razorpay_order_id: string | null;
}

// ─── Create Razorpay Order ────────────────────────────────────────────────────

export interface RazorpayOrderResult {
  razorpay_order_id: string;
  amount: number;      // paise
  currency: string;
  key_id: string;
}

/**
 * Creates a Razorpay order for an existing pending DB order.
 * Stores the resulting razorpay_order_id on the orders row.
 * Safe to call again on a failed order (overwrites previous razorpay_order_id).
 */
export async function initRazorpayOrder(
  userId: number,
  orderId: number,
): Promise<RazorpayOrderResult> {
  const [rows] = await pool.execute<OrderRow[]>(
    `SELECT id, user_id, total, payment_status, razorpay_order_id
     FROM orders
     WHERE id = ? AND user_id = ?`,
    [orderId, userId],
  );

  if (rows.length === 0) throw new AppError('Order not found', 404);
  const order = rows[0];
  if (order.payment_status === 'paid') throw new AppError('Order is already paid', 409);

  const amountPaise = Math.round(parseFloat(order.total) * 100);

  const rzpOrder = await getRzp().orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt: `fnf_${orderId}`,
  });

  // Persist razorpay_order_id immediately so verify-payment can cross-check it
  await pool.execute(
    'UPDATE orders SET razorpay_order_id = ? WHERE id = ?',
    [rzpOrder.id, orderId],
  );

  return {
    razorpay_order_id: rzpOrder.id as string,
    amount: amountPaise,
    currency: 'INR',
    key_id: process.env.RAZORPAY_KEY_ID ?? '',
  };
}

// ─── Verify Payment & Complete Order ─────────────────────────────────────────

export interface VerifyPaymentInput {
  order_id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Verifies Razorpay HMAC-SHA256 signature server-side, then updates
 * payment_status → 'paid' and order status → 'confirmed'.
 *
 * Idempotent: silently returns if the order is already marked paid.
 */
export async function verifyAndCompletePayment(
  userId: number,
  data: VerifyPaymentInput,
): Promise<void> {
  // 1. Verify signature — reject before any DB work
  const sigBody = `${data.razorpay_order_id}|${data.razorpay_payment_id}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET ?? '')
    .update(sigBody)
    .digest('hex');

  let signaturesMatch = false;
  try {
    signaturesMatch = crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(data.razorpay_signature, 'hex'),
    );
  } catch {
    // Buffer length mismatch — signatures cannot match
  }
  if (!signaturesMatch) throw new AppError('Invalid payment signature', 400);

  // 2. Verify order ownership and razorpay_order_id consistency
  const [rows] = await pool.execute<OrderRow[]>(
    `SELECT id, payment_status, razorpay_order_id
     FROM orders
     WHERE id = ? AND user_id = ?`,
    [data.order_id, userId],
  );
  if (rows.length === 0) throw new AppError('Order not found', 404);

  const order = rows[0];
  if (order.payment_status === 'paid') return; // idempotent

  if (order.razorpay_order_id !== data.razorpay_order_id) {
    throw new AppError('Payment order ID mismatch', 400);
  }

  // 3. Persist — updateOrderPayment also promotes status to 'confirmed'
  await updateOrderPayment(data.order_id, {
    razorpay_order_id: data.razorpay_order_id,
    payment_id: data.razorpay_payment_id,
    payment_status: 'paid',
  });
}

// ─── Webhook ──────────────────────────────────────────────────────────────────

/**
 * Verifies the X-Razorpay-Signature header against the raw request body
 * using the webhook secret. Must be called with the original raw body string.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET ?? '')
    .update(rawBody)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature, 'hex'),
    );
  } catch {
    return false;
  }
}

interface WebhookPaymentEntity {
  id: string;
  order_id: string;
}

/**
 * Processes webhook events sent directly by Razorpay.
 * Only handles payment.captured and payment.failed.
 * Idempotent — safe to call multiple times for the same event.
 */
export async function handleWebhookEvent(
  event: string,
  paymentEntity: WebhookPaymentEntity,
): Promise<void> {
  if (event !== 'payment.captured' && event !== 'payment.failed') return;

  // Look up our order by razorpay_order_id (webhook has no user context)
  const [rows] = await pool.execute<OrderRow[]>(
    `SELECT id, payment_status FROM orders WHERE razorpay_order_id = ?`,
    [paymentEntity.order_id],
  );
  if (rows.length === 0) return; // unknown order — not ours, ignore

  const order = rows[0];
  if (order.payment_status === 'paid') return; // already processed

  const paymentStatus: PaymentStatus =
    event === 'payment.captured' ? 'paid' : 'failed';

  await updateOrderPayment(order.id, {
    razorpay_order_id: paymentEntity.order_id,
    payment_id: paymentEntity.id,
    payment_status: paymentStatus,
  });
}
