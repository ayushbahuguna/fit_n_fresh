import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import AddToCartButton from './AddToCartButton';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const coverImage = product.images[0] ?? '/placeholder-product.jpg';

  return (
    <article className="group flex flex-col rounded-2xl border border-surface-border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative overflow-hidden aspect-square bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        tabIndex={0}
      >
        <Image
          src={coverImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-sm font-semibold text-ink-muted tracking-wide">
              Out of Stock
            </span>
          </div>
        )}

        {/* Low stock badge */}
        {isLowStock && (
          <div className="absolute top-3 left-3">
            <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Only {product.stock} left
            </span>
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-4">
        <div className="flex-1">
          <Link
            href={`/products/${product.slug}`}
            className="group/title focus-visible:outline-none"
          >
            <h3 className="font-semibold text-ink leading-snug line-clamp-2 group-hover/title:text-primary transition-colors duration-150">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1.5 text-sm text-ink-muted line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-accent font-display">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {!isOutOfStock && !isLowStock && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              In Stock
            </span>
          )}
        </div>

        <AddToCartButton
          productId={product.id}
          productName={product.name}
          disabled={isOutOfStock}
          size="sm"
        />
      </div>
    </article>
  );
}
