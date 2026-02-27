import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/services/productService';
import Container from '@/components/layout/Container';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import AddToCartButton from '@/components/products/AddToCartButton';

interface Props {
  params: Promise<{ slug: string }>;
}

// Deduplicates the DB fetch between generateMetadata and the page render
const fetchProduct = cache(getProductBySlug);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return { title: 'Product Not Found' };
  return { title: product.name };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) notFound();

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;

  return (
    <main className="py-10 md:py-16">
      <Container>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-ink-subtle">
            <li>
              <a href="/" className="hover:text-ink transition-colors duration-150">
                Home
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <a
                href="/products"
                className="hover:text-ink transition-colors duration-150"
              >
                Products
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ink-muted font-medium line-clamp-1">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left: image gallery — sticky on large screens */}
          <div className="lg:sticky lg:top-24">
            <ProductImageGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          {/* Right: product info */}
          <div className="flex flex-col gap-6">
            {/* Category badge */}
            <span className="inline-flex w-fit items-center px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent-dark border border-accent/20 tracking-wide uppercase">
              Health &amp; Fitness
            </span>

            {/* Name & price */}
            <div>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-ink leading-tight">
                {product.name}
              </h1>
              <p className="mt-4 text-3xl font-bold text-accent">
                ₹{product.price.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Stock status */}
            <div>
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-2 text-sm font-medium text-red-500">
                  <span className="w-2 h-2 rounded-full bg-red-400" aria-hidden="true" />
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-2 text-sm font-medium text-amber-600">
                  <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
                  Only {product.stock} left — order soon
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
                  In Stock
                </span>
              )}
            </div>

            {/* Divider + description */}
            <div className="border-t border-surface-border pt-6">
              <h2 className="text-sm font-semibold text-ink uppercase tracking-wider mb-3">
                About this product
              </h2>
              <p className="text-ink-muted leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* CTA */}
            <div className="pt-2">
              <AddToCartButton
                productId={product.id}
                productName={product.name}
                disabled={isOutOfStock}
                size="lg"
              />
            </div>

            {/* Trust badges */}
            <div className="border-t border-surface-border pt-6 grid grid-cols-3 gap-4">
              {TRUST_BADGES.map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 text-center"
                >
                  <span className="text-2xl" aria-hidden="true">
                    {icon}
                  </span>
                  <span className="text-xs text-ink-subtle font-medium leading-tight">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

const TRUST_BADGES = [
  { icon: '🔒', label: 'Secure Checkout' },
  { icon: '🚚', label: 'Fast Delivery' },
  { icon: '✅', label: 'Quality Assured' },
] as const;
