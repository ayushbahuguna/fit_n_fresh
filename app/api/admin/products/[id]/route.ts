import { type NextRequest } from 'next/server';
import { updateProduct, deleteProduct } from '@/services/productService';
import { requireAdmin } from '@/lib/session';
import { AppError } from '@/lib/errors';
import { ok, error, serverError } from '@/lib/response';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return error('Invalid request body', 400);
  }

  try {
    await requireAdmin();
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) return error('Invalid product ID', 400);

    const product = await updateProduct(productId, {
      ...(body.name !== undefined && { name: String(body.name) }),
      ...(body.slug !== undefined && { slug: String(body.slug) }),
      ...(body.description !== undefined && { description: String(body.description) }),
      ...(body.price !== undefined && { price: Number(body.price) }),
      ...(body.stock !== undefined && { stock: Number(body.stock) }),
      ...(body.images !== undefined && {
        images: Array.isArray(body.images) ? body.images.map(String) : [],
      }),
      ...(body.is_active !== undefined && { is_active: Boolean(body.is_active) }),
    });
    return ok(product);
  } catch (err) {
    if (err instanceof AppError) return error(err.message, err.statusCode);
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) return error('Invalid product ID', 400);

    await deleteProduct(productId);
    return ok({ message: 'Product deactivated' });
  } catch (err) {
    if (err instanceof AppError) return error(err.message, err.statusCode);
    return serverError();
  }
}
