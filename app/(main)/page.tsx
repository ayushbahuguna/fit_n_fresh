import Link from 'next/link';
import Container from '@/components/layout/Container';
import Button from '@/components/ui/Button';

export default function HomePage() {
  return (
    <section className="py-20 md:py-32">
      <Container>
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">
          Health &amp; Fitness
        </p>
        <h1 className="max-w-2xl">
          Fuel your best performance.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-ink-muted">
          Premium supplements and nutrition products, crafted for serious athletes.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          {/* Navigational CTA — styled as a primary button but rendered as <a> */}
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 font-semibold h-12 px-8 text-base rounded-full bg-primary text-white hover:bg-primary-light active:bg-primary-dark transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          >
            Shop Products
          </Link>
          <Button variant="secondary" size="lg">Learn More</Button>
        </div>
      </Container>
    </section>
  );
}
