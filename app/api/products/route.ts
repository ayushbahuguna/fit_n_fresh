import { getActiveProducts } from '@/services/productService';
import { ok, serverError } from '@/lib/response';

export async function GET() {
  try {
    const products = await getActiveProducts();
    return ok(products);
  } catch {
    return serverError();
  }
}
