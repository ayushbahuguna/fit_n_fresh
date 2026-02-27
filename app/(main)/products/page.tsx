import type { Metadata } from 'next';
import { getActiveProducts } from '@/services/productService';
import Container from '@/components/layout/Container';
import ProductCard from '@/components/products/ProductCard';

export const metadata: Metadata = {
  title: 'Products',
};

export default async function ProductsPage() {
  const products = await getActiveProducts();

  return (
    <main>
      {/* Page header */}
      <section className="bg-primary py-16 md:py-20">
        <Container>
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">
            Our Range
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight max-w-xl">
            Premium Nutrition, Delivered.
          </h1>
          <p className="mt-4 text-white/70 text-base md:text-lg max-w-md">
            Scientifically formulated for serious performance. Every ingredient
            earns its place.
          </p>
        </Container>
      </section>

      {/* Product grid */}
      <section className="py-12 md:py-16 bg-surface">
        <Container>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <p className="text-ink-muted text-lg font-medium">
                No products available right now.
              </p>
              <p className="text-ink-subtle text-sm">Check back soon.</p>
            </div>
          ) : (
            <>
              <p className="mb-8 text-sm text-ink-subtle">
                {products.length} product{products.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </Container>
      </section>
    </main>
  );
}
