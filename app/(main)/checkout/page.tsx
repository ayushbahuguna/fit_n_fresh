'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Container from '@/components/layout/Container';
import AddressForm from '@/components/checkout/AddressForm';
import { useCart } from '@/contexts/CartContext';
import type { Address, OrderWithItems } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { summary, loading: cartLoading, refreshCart } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const fetchAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    try {
      const res = await fetch('/api/addresses');
      if (!res.ok) return;
      const data = await res.json();
      const list = data.data as Address[];
      setAddresses(list);
      const defaultAddr = list.find((a) => a.is_default) ?? list[0];
      if (defaultAddr) setSelectedId(defaultAddr.id);
      if (list.length === 0) setShowForm(true);
    } catch {
      /* silent */
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    if (!cartLoading && summary) fetchAddresses();
    if (!cartLoading && !summary) setLoadingAddresses(false);
  }, [cartLoading, summary, fetchAddresses]);

  function handleAddressAdded(addr: Address) {
    setAddresses((prev) => {
      const updated = prev.filter((a) => a.id !== addr.id);
      return addr.is_default
        ? [addr, ...updated.map((a) => ({ ...a, is_default: false }))]
        : [addr, ...updated];
    });
    setSelectedId(addr.id);
    setShowForm(false);
  }

  async function handlePlaceOrder() {
    if (!selectedId) {
      setSubmitError('Please select a delivery address to continue.');
      return;
    }
    setSubmitError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address_id: selectedId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.message ?? 'Failed to place order. Please try again.');
        return;
      }
      const order = data.data as OrderWithItems;
      // Refresh cart badge before navigation (cart was cleared server-side)
      await refreshCart();
      router.push(`/orders/${order.id}`);
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (cartLoading || loadingAddresses) {
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

  // ── Unauthenticated ───────────────────────────────────────────────────────

  if (!summary) {
    return (
      <section className="py-12 sm:py-16">
        <Container>
          <div className="mx-auto max-w-sm py-20 text-center">
            <h1 className="text-2xl font-bold text-ink">Sign in to checkout</h1>
            <p className="mt-3 text-ink-muted">
              You need to be signed in to complete your purchase.
            </p>
            <Link
              href="/login?redirect=/checkout"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light active:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Sign In
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  // ── Empty cart ────────────────────────────────────────────────────────────

  if (summary.items.length === 0) {
    return (
      <section className="py-12 sm:py-16">
        <Container>
          <div className="mx-auto max-w-sm py-20 text-center">
            <h1 className="text-2xl font-bold text-ink">Your cart is empty</h1>
            <p className="mt-3 text-ink-muted">Add some items before checking out.</p>
            <Link
              href="/products"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light active:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Shop Products
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  // ── Checkout ──────────────────────────────────────────────────────────────

  const { items, total, itemCount } = summary;

  return (
    <section className="py-8 sm:py-12">
      <Container>
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-ink-muted">
          <Link href="/cart" className="transition-colors hover:text-ink">Cart</Link>
          <ChevronIcon />
          <span className="text-ink">Checkout</span>
        </nav>

        <h1 className="mb-6 text-2xl font-bold text-ink sm:mb-8 sm:text-3xl">Checkout</h1>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">

          {/* ── Left: Delivery Address ──────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <div className="rounded-2xl border border-surface-border bg-white">
              {/* Section header */}
              <div className="flex items-center justify-between border-b border-surface-border px-5 py-4 sm:px-6">
                <h2 className="text-base font-bold text-ink">Delivery Address</h2>
                {addresses.length > 0 && !showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="text-sm font-medium text-primary transition-colors hover:text-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                  >
                    + Add New
                  </button>
                )}
              </div>

              {/* Saved address cards */}
              {addresses.length > 0 && (
                <div className="divide-y divide-surface-border">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={[
                        'flex cursor-pointer items-start gap-3 px-5 py-4 transition-colors sm:px-6',
                        selectedId === addr.id ? 'bg-surface' : 'hover:bg-surface',
                      ].join(' ')}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedId === addr.id}
                        onChange={() => { setSelectedId(addr.id); setShowForm(false); }}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-ink">{addr.name}</span>
                          {addr.is_default && (
                            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''},{' '}
                          {addr.city}, {addr.state} — {addr.pincode}
                        </p>
                        <p className="mt-0.5 text-sm text-ink-muted">{addr.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Add new address form */}
              {showForm && (
                <div className="px-5 py-5 sm:px-6">
                  {addresses.length > 0 && (
                    <h3 className="mb-4 text-sm font-semibold text-ink">New Address</h3>
                  )}
                  <AddressForm
                    onSuccess={handleAddressAdded}
                    onCancel={addresses.length > 0 ? () => setShowForm(false) : undefined}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Order Summary ────────────────────────────────────── */}
          <div className="w-full lg:w-80 xl:w-96 lg:sticky lg:top-24 shrink-0">
            <div className="rounded-2xl border border-surface-border bg-white p-5 sm:p-6">
              <h2 className="mb-4 text-base font-bold text-ink">
                Order Summary
                <span className="ml-2 text-sm font-normal text-ink-muted">
                  ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </span>
              </h2>

              {/* Item list */}
              <div className="mb-4 space-y-3 border-b border-surface-border pb-4">
                {items.map((item) => (
                  <div key={item.product_id} className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-ink-muted">Qty: {item.quantity}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-ink">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Subtotal</span>
                  <span className="font-semibold text-ink">
                    ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Shipping</span>
                  <span className="font-medium text-emerald-600">Free</span>
                </div>
              </div>

              <div className="mt-3 border-t border-surface-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-ink">Total</span>
                  <span className="font-display text-xl font-bold text-accent">
                    ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Inline error */}
              {submitError && (
                <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {submitError}
                </div>
              )}

              {/* CTA */}
              <div className="mt-5">
                <button
                  onClick={handlePlaceOrder}
                  disabled={submitting || !selectedId || showForm}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-primary transition-colors hover:bg-accent-light active:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                      Placing Order…
                    </>
                  ) : (
                    <>
                      Place Order
                      <LockIcon />
                    </>
                  )}
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-ink-subtle">
                Secure checkout · All prices in INR
              </p>
            </div>

            <Link
              href="/cart"
              className="mt-4 flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              <ArrowLeftIcon />
              Back to Cart
            </Link>
          </div>

        </div>
      </Container>
    </section>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
