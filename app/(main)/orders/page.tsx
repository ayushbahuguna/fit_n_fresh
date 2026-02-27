import Link from 'next/link';
import { redirect } from 'next/navigation';
import Container from '@/components/layout/Container';
import { getSession } from '@/lib/session';
import { getUserOrders } from '@/services/orderService';
import type { OrderStatus, PaymentStatus } from '@/types';

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:   'bg-yellow-50 text-yellow-700',
  confirmed: 'bg-blue-50 text-blue-700',
  shipped:   'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-600',
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  pending:  'text-yellow-600',
  paid:     'text-green-600',
  failed:   'text-red-500',
  refunded: 'text-blue-600',
};

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect('/login?redirect=/orders');

  const orders = await getUserOrders(session.userId);

  return (
    <section className="py-8 sm:py-12">
      <Container>
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">My Orders</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {orders.length === 0
              ? 'No orders placed yet.'
              : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="mx-auto max-w-sm py-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
              <BoxIcon />
            </div>
            <p className="text-ink-muted">You haven&apos;t placed any orders yet.</p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light active:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Shop Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-2xl border border-surface-border bg-white p-5 transition-shadow hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Order ID + Date */}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-ink-subtle">
                      {order.order_number}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Status badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[order.status]}`}
                    >
                      {order.status}
                    </span>
                    <span className={`text-xs font-semibold capitalize ${PAYMENT_STYLES[order.payment_status]}`}>
                      {order.payment_status === 'paid' ? '✓ Paid' : order.payment_status}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="sm:text-right">
                    <p className="font-display text-lg font-bold text-accent">
                      ₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

function BoxIcon() {
  return (
    <svg
      width="28" height="28" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="text-ink-subtle" aria-hidden="true"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
