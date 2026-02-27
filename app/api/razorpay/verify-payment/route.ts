import { type NextRequest } from 'next/server';
import { verifyAndCompletePayment } from '@/services/paymentService';
import { requireAuth } from '@/lib/session';
import { AppError } from '@/lib/errors';
import { ok, error, serverError } from '@/lib/response';

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return error('Invalid request body', 400);
  }

  try {
    const session = await requireAuth();

    const order_id = parseInt(String(body.order_id ?? ''), 10);
    const razorpay_order_id = String(body.razorpay_order_id ?? '').trim();
    const razorpay_payment_id = String(body.razorpay_payment_id ?? '').trim();
    const razorpay_signature = String(body.razorpay_signature ?? '').trim();

    if (isNaN(order_id)) return error('order_id is required', 400);
    if (!razorpay_order_id) return error('razorpay_order_id is required', 400);
    if (!razorpay_payment_id) return error('razorpay_payment_id is required', 400);
    if (!razorpay_signature) return error('razorpay_signature is required', 400);

    await verifyAndCompletePayment(session.userId, {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    return ok({ order_id });
  } catch (err) {
    if (err instanceof AppError) return error(err.message, err.statusCode);
    return serverError();
  }
}
