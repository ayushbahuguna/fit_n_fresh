import Link from 'next/link';

export default function BrandPanel() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 lg:flex lg:w-[55%]">

      {/* ── Atmospheric depth elements ──────────────────────────────── */}
      <div
        className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-light/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent/8 blur-3xl"
        aria-hidden="true"
      />

      {/* ── Logo ──────────────────────────────────────────────────────── */}
      <Link
        href="/"
        className="relative z-10 inline-block font-display text-xl font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
      >
        FIT N<span className="text-accent"> FRESH</span>
      </Link>

      {/* ── Hero copy ─────────────────────────────────────────────────── */}
      <div className="relative z-10">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">
          Premium Health &amp; Fitness
        </p>
        <h2 className="font-display text-4xl font-bold leading-tight text-white xl:text-5xl">
          Fuel your<br />best performance.
        </h2>
        <p className="mt-6 max-w-sm leading-relaxed text-white/65">
          Trusted by thousands of athletes who demand the best from their
          nutrition and performance supplements.
        </p>
      </div>

      {/* ── Testimonial ───────────────────────────────────────────────── */}
      <div className="relative z-10 border-t border-white/10 pt-8">
        <p className="text-sm italic leading-relaxed text-white/50">
          &ldquo;The quality and results speak for themselves. My performance
          has improved significantly since switching to Fit N Fresh.&rdquo;
        </p>
        <p className="mt-3 text-sm font-semibold text-white">
          — Arjun Mehta, Professional Athlete
        </p>
      </div>

    </div>
  );
}
