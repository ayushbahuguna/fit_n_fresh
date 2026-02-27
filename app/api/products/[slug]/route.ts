import { getProductBySlug } from '@/services/productService';
import { ok, notFound, serverError } from '@/lib/response';

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) return notFound('Product not found');
    return ok(product);
  } catch {
    return serverError();
  }
}
