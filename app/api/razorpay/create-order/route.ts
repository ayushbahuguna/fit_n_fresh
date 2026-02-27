import { type NextRequest } from 'next/server';
import { initRazorpayOrder } from '@/services/paymentService';
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

    const orderId = parseInt(String(body.order_id ?? ''), 10);
    if (isNaN(orderId)) return error('order_id is required', 400);

    const result = await initRazorpayOrder(session.userId, orderId);
    return ok(result);
  } catch (err) {
    if (err instanceof AppError) return error(err.message, err.statusCode);
    return serverError();
  }
}
