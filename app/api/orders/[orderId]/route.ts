import { type NextRequest } from 'next/server';
import { getOrderByIdForUser } from '@/services/orderService';
import { requireAuth } from '@/lib/session';
import { AppError } from '@/lib/errors';
import { ok, error, notFound, serverError } from '@/lib/response';

interface Params {
  params: Promise<{ orderId: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { orderId: orderIdStr } = await params;
    const orderId = parseInt(orderIdStr, 10);

    if (isNaN(orderId)) return error('Invalid order ID', 400);

    const order = await getOrderByIdForUser(session.userId, orderId);
    if (!order) return notFound('Order not found');

    return ok(order);
  } catch (err) {
    if (err instanceof AppError) return error(err.message, err.statusCode);
    return serverError();
  }
}
