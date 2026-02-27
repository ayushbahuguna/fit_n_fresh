'use client';

import Link from 'next/link';
import Container from '@/components/layout/Container';
import CartItemRow from '@/components/cart/CartItemRow';
import { useCart } from '@/contexts/CartContext';

export default function CartPage() {
  const { summary, loading } = useCart();

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="py-12 sm:py-16">
        <Container>
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-surface-border border-t-primary" />
          </div>
        </Container>
      </section>
    );
  }

  // ── Unauthenticated ────────────────────────────────────────────────────────
  if (!summary) {
    return (
      <section className="py-12 sm:py-16">
        <Container>
          <div className="mx-auto max-w-sm py-20 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
              <CartIconLg />
            </div>
            <h1 className="text-2xl font-bold text-ink">Your cart is waiting</h1>
            <p className="mt-3 text-ink-muted">
              Sign in to view your cart and continue to checkout.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <Link
                href="/login?redirect=/cart"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light active:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Sign In
              </Link>
              <Link
                href="/products"
                className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
              >
                Browse Products →
              </Link>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  // ── Empty cart ─────────────────────────────────────────────────────────────
  if (summary.items.length === 0) {
    return (
      <section className="py-12 sm:py-16">
        <Container>
          <div className="mx-auto max-w-sm py-20 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
              <CartIconLg />
            </div>
            <h1 className="text-2xl font-bold text-ink">Your cart is empty</h1>
            <p className="mt-3 text-ink-muted">
              Looks like you haven&apos;t added anything yet.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light active:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Shop Products
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  // ── Cart with items ────────────────────────────────────────────────────────
  const { items, total, itemCount } = summary;

  return (
    <section className="py-8 sm:py-12">
      <Container>
        {/* Page heading */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">
            Your Cart
            <span className="ml-2 text-base font-normal text-ink-muted">
              ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </span>
          </h1>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">

          {/* ── Cart Items ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <div className="rounded-2xl border border-surface-border bg-white">
              <div className="divide-y divide-surface-border px-5 sm:px-6">
                {items.map((item) => (
                  <CartItemRow key={item.product_id} item={item} />
                ))}
              </div>
            </div>

            <Link
              href="/products"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors duration-150 hover:text-ink"
            >
              <ArrowLeftIcon />
              Continue Shopping
            </Link>
          </div>

          {/* ── Order Summary ───────────────────────────────────────────── */}
          <div className="w-full lg:w-80 xl:w-96 lg:sticky lg:top-24 shrink-0">
            <div className="rounded-2xl border border-surface-border bg-white p-5 sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-ink">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">
                    Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                  </span>
                  <span className="font-semibold text-ink">
                    ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Shipping</span>
                  <span className="font-medium text-emerald-600">
                    Calculated at checkout
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-surface-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-ink">Total</span>
                  <span className="font-display text-xl font-bold text-accent">
                    ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <Link
                  href="/checkout"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light active:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Proceed to Checkout
                  <ArrowRightIcon />
                </Link>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-ink-subtle">
              Secure checkout powered by Razorpay
            </p>
          </div>

        </div>
      </Container>
    </section>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CartIconLg() {
  return (
    <svg
      width="28" height="28" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="text-ink-subtle"
      aria-hidden="true"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
