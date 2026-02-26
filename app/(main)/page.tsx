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
          <Button size="lg">Shop Products</Button>
          <Button variant="secondary" size="lg">Learn More</Button>
        </div>
      </Container>
    </section>
  );
}
