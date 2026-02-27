import { type NextRequest } from 'next/server';
import { getCart, addToCart } from '@/services/cartService';
import { requireAuth } from '@/lib/session';
import { AppError } from '@/lib/errors';
import { ok, error, serverError } from '@/lib/response';
import type { CartItemWithProduct, CartSummary } from '@/types';

function buildSummary(items: CartItemWithProduct[]): CartSummary {
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  return {
    items,
    total: parseFloat(total.toFixed(2)),
    itemCount: items.reduce((n, item) => n + item.quantity, 0),
  };
}

export async function GET() {
  try {
    const session = await requireAuth();
    const items = await getCart(session.userId);
    return ok(buildSummary(items));
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
    const productId = parseInt(String(body.product_id ?? ''), 10);
    const quantity = parseInt(String(body.quantity ?? '1'), 10);

    if (isNaN(productId)) return error('product_id is required', 400);
    if (isNaN(quantity)) return error('Invalid quantity', 400);

    const items = await addToCart(session.userId, productId, quantity);
    return ok(buildSummary(items));
  } catch (err) {
    if (err instanceof AppError) return error(err.message, err.statusCode);
    return serverError();
  }
}
