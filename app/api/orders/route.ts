import { type NextRequest } from 'next/server';
import { createOrder, getUserOrders } from '@/services/orderService';
import { requireAuth } from '@/lib/session';
import { AppError } from '@/lib/errors';
import { ok, created, error, serverError } from '@/lib/response';

export async function GET() {
  try {
    const session = await requireAuth();
    const orders = await getUserOrders(session.userId);
    return ok(orders);
  } catch (err) {
    if (err instanceof AppError) return error(err.message, err.statusCode);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return error('Invalid request body', 400);
  }

  try {
    const session = await requireAuth();
    const addressId = parseInt(String(body.address_id ?? ''), 10);

    if (isNaN(addressId)) return error('address_id is required', 400);

    const order = await createOrder(session.userId, addressId);
    return created(order);
  } catch (err) {
    if (err instanceof AppError) return error(err.message, err.statusCode);
    return serverError();
  }
}
