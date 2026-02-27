import { type NextRequest } from 'next/server';
import { getAllProducts, createProduct } from '@/services/productService';
import { requireAdmin } from '@/lib/session';
import { AppError } from '@/lib/errors';
import { ok, created, error, serverError } from '@/lib/response';

export async function GET() {
  try {
    await requireAdmin();
    const products = await getAllProducts();
    return ok(products);
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
    await requireAdmin();
    const product = await createProduct({
      name: String(body.name ?? ''),
      slug: body.slug ? String(body.slug) : undefined,
      description: String(body.description ?? ''),
      price: Number(body.price),
      stock: Number(body.stock ?? 0),
      images: Array.isArray(body.images) ? body.images.map(String) : [],
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : undefined,
    });
    return created(product);
  } catch (err) {
    if (err instanceof AppError) return error(err.message, err.statusCode);
    return serverError();
  }
}
