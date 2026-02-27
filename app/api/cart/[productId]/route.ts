import { type NextRequest } from 'next/server';
import { updateQuantity, removeFromCart, getCart } from '@/services/cartService';
import { requireAuth } from '@/lib/session';
import { AppError } from '@/lib/errors';
import { ok, error, serverError } from '@/lib/response';
import type { CartItemWithProduct, CartSummary } from '@/types';

interface Params {
  params: Promise<{ productId: string }>;
}

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

export async function PATCH(request: NextRequest, { params }: Params) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return error('Invalid request body', 400);
  }

  try {
    const session = await requireAuth();
    const { productId: pidStr } = await params;
    const productId = parseInt(pidStr, 10);
    const quantity = parseInt(String(body.quantity ?? ''), 10);

    if (isNaN(productId)) return error('Invalid product ID', 400);
    if (isNaN(quantity)) return error('quantity is required', 400);

    const items = await updateQuantity(session.userId, productId, quantity);
    return ok(buildSummary(items));
  } catch (err) {
    if (err instanceof AppError) return error(err.message, err.statusCode);
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { productId: pidStr } = await params;
    const productId = parseInt(pidStr, 10);

    if (isNaN(productId)) return error('Invalid product ID', 400);

    await removeFromCart(session.userId, productId);
    const items = await getCart(session.userId);
    return ok(buildSummary(items));
  } catch (err) {
    if (err instanceof AppError) return error(err.message, err.statusCode);
    return serverError();
  }
}
