import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import Container from '@/components/layout/Container';
import { getSession } from '@/lib/session';
import { getOrderByIdForUser } from '@/services/orderService';
import type { OrderStatus, PaymentStatus } from '@/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  pending:   { label: 'Pending',   className: 'bg-yellow-50 text-yellow-700' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-50 text-blue-700' },
  shipped:   { label: 'Shipped',   className: 'bg-purple-50 text-purple-700' },
  delivered: { label: 'Delivered', className: 'bg-green-50 text-green-700' },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-600' },
};

const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  pending:  { label: 'Payment Pending', className: 'text-yellow-600' },
  paid:     { label: 'Paid',            className: 'text-green-600' },
  failed:   { label: 'Payment Failed',  className: 'text-red-500' },
  refunded: { label: 'Refunded',        className: 'text-blue-600' },
};

interface Params {
  params: Promise<{ orderId: string }>;
}

export default async function OrderDetailPage({ params }: Params) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { orderId: orderIdStr } = await params;
  const orderId = parseInt(orderIdStr, 10);
  if (isNaN(orderId)) notFound();

  const order = await getOrderByIdForUser(session.userId, orderId);
  if (!order) notFound();

  const status = STATUS_CONFIG[order.status];
  const payment = PAYMENT_CONFIG[order.payment_status];
  const addr = order.shipping_address;

  return (
    <section className="py-8 sm:py-12">
      <Container>
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-ink-muted">
          <Link href="/orders" className="transition-colors hover:text-ink">Orders</Link>
          <ChevronIcon />
          <span className="font-mono text-ink">{order.order_number}</span>
        </nav>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink sm:text-2xl">
              Order #{order.order_number}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Placed on{' '}
              {new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
              {status.label}
            </span>
            <span className={`text-sm font-semibold ${payment.className}`}>
              {payment.label}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">

          {/* ── Left: Items Ordered ──────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <div className="rounded-2xl border border-surface-border bg-white">
              <div className="border-b border-surface-border px-5 py-4 sm:px-6">
                <h2 className="text-base font-bold text-ink">Items Ordered</h2>
              </div>

              <div className="divide-y divide-surface-border">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                  >
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product_slug}`}
                        className="text-sm font-semibold text-ink transition-colors hover:text-primary line-clamp-2"
                      >
                        {item.product_name}
                      </Link>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        Qty {item.quantity} × ₹{item.unit_price.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-ink">
                      ₹{(item.unit_price * item.quantity).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order total */}
              <div className="flex items-center justify-between border-t border-surface-border px-5 py-4 sm:px-6">
                <span className="text-base font-bold text-ink">Order Total</span>
                <span className="font-display text-xl font-bold text-accent">
                  ₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* ── Right: Shipping + Info ───────────────────────────────────── */}
          <div className="w-full space-y-4 lg:w-72 xl:w-80 shrink-0">

            {/* Delivery address */}
            <div className="rounded-2xl border border-surface-border bg-white p-5 sm:p-6">
              <h2 className="mb-3 text-base font-bold text-ink">Delivery Address</h2>
              <p className="text-sm font-semibold text-ink">{addr.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                {addr.line1}
                {addr.line2 ? `, ${addr.line2}` : ''}
                <br />
                {addr.city}, {addr.state}
                <br />
                {addr.pincode}
              </p>
              <p className="mt-2 text-sm text-ink-muted">{addr.phone}</p>
            </div>

            {/* Order info */}
            <div className="rounded-2xl border border-surface-border bg-white p-5 sm:p-6">
              <h2 className="mb-3 text-base font-bold text-ink">Order Info</h2>
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-ink-muted">Order Number</dt>
                  <dd className="font-mono text-xs font-medium text-ink">{order.order_number}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-ink-muted">Status</dt>
                  <dd className="capitalize font-medium text-ink">{order.status}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-ink-muted">Payment</dt>
                  <dd className={`font-semibold ${payment.className}`}>{payment.label}</dd>
                </div>
                {order.payment_id && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-ink-muted">Payment ID</dt>
                    <dd className="font-mono text-xs text-ink break-all">{order.payment_id}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

        </div>

        {/* Back link */}
        <div className="mt-8">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeftIcon />
            Back to Orders
          </Link>
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

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
