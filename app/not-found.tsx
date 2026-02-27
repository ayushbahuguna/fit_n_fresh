import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Container from '@/components/layout/Container';
import { CartProvider } from '@/contexts/CartContext';
import { getSession } from '@/lib/session';

export default async function NotFound() {
  const session = await getSession();
  const user = session ? { role: session.role } : null;

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar user={user} />

        <main className="flex flex-1 items-center py-20 sm:py-28">
          <Container>
            <div className="relative mx-auto max-w-xl overflow-hidden text-center">

              {/* Decorative blur orbs */}
              <div
                className="pointer-events-none absolute -top-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -bottom-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-accent/8 blur-3xl"
                aria-hidden="true"
              />

              {/* 404 display number */}
              <p className="relative font-display text-[108px] font-extrabold leading-none tracking-tight text-primary/10 sm:text-[152px]">
                404
              </p>

              {/* Heading — pulled up to overlap the large number */}
              <div className="relative -mt-6 sm:-mt-8">
                <h1 className="text-2xl font-bold text-ink sm:text-3xl">
                  Page not found
                </h1>
                <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-ink-muted">
                  This page has gone off the grid. Head back and discover our
                  premium health &amp; fitness range crafted for peak performance.
                </p>
              </div>

              {/* CTAs */}
              <div className="relative mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/products"
                  className="inline-flex w-full items-center justify-center rounded-full bg-accent px-8 py-3 text-sm font-bold text-primary transition-colors hover:bg-accent-light active:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:w-auto"
                >
                  Browse Products
                </Link>
                <Link
                  href="/"
                  className="inline-flex w-full items-center justify-center rounded-full border border-surface-border px-8 py-3 text-sm font-semibold text-ink-muted transition-colors hover:border-primary/20 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-auto"
                >
                  Return Home
                </Link>
              </div>

            </div>
          </Container>
        </main>

        <Footer />
      </div>
    </CartProvider>
  );
}
