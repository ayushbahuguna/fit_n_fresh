'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CartItemWithProduct } from '@/types';
import { useCart } from '@/contexts/CartContext';

interface CartItemRowProps {
  item: CartItemWithProduct;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCart();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const { product, quantity, product_id } = item;
  const image = product.images[0] ?? '/placeholder-product.jpg';
  const lineTotal = (product.price * quantity).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  function showError(msg: string) {
    setError(msg);
    setTimeout(() => setError(''), 3000);
  }

  async function handleDecrement() {
    if (updating) return;
    setUpdating(true);
    try {
      // quantity - 1 === 0 triggers remove in the service layer
      await updateQuantity(product_id, quantity - 1);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setUpdating(false);
    }
  }

  async function handleIncrement() {
    if (updating || quantity >= product.stock) return;
    setUpdating(true);
    try {
      await updateQuantity(product_id, quantity + 1);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setUpdating(false);
    }
  }

  async function handleRemove() {
    if (updating) return;
    setUpdating(true);
    try {
      await removeItem(product_id);
    } catch {
      setUpdating(false);
    }
  }

  const isUnavailable = !product.is_active;

  return (
    <div className="flex gap-4 py-5 sm:gap-5">
      {/* Thumbnail */}
      <Link
        href={`/products/${product.slug}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-surface-border bg-surface-muted sm:h-24 sm:w-24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="96px"
          className="object-cover"
        />
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/products/${product.slug}`}
              className="font-semibold text-ink line-clamp-2 leading-snug hover:text-primary transition-colors duration-150 focus-visible:outline-none"
            >
              {product.name}
            </Link>
            {isUnavailable && (
              <p className="mt-0.5 text-xs font-medium text-red-500">
                No longer available
              </p>
            )}
          </div>
          <p className="shrink-0 font-bold text-accent font-display">
            ₹{lineTotal}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Quantity stepper */}
          {!isUnavailable ? (
            <div className="flex items-center gap-1 rounded-full border border-surface-border bg-white px-1">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={updating}
                aria-label={quantity === 1 ? 'Remove item' : 'Decrease quantity'}
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink disabled:opacity-40"
              >
                {quantity === 1 ? <TrashIcon /> : <MinusIcon />}
              </button>
              <span className="min-w-[1.5rem] text-center text-sm font-semibold text-ink">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={updating || quantity >= product.stock}
                aria-label="Increase quantity"
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink disabled:opacity-40"
              >
                <PlusIcon />
              </button>
            </div>
          ) : (
            <div />
          )}

          {/* Remove button */}
          <button
            type="button"
            onClick={handleRemove}
            disabled={updating}
            className="text-xs font-medium text-ink-subtle transition-colors duration-150 hover:text-red-500 disabled:opacity-40 focus-visible:outline-none focus-visible:underline"
          >
            Remove
          </button>
        </div>

        {/* Inline error */}
        {error && (
          <p className="text-xs font-medium text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function MinusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
