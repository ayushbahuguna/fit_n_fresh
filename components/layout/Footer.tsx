import Link from 'next/link';
import Container from './Container';

const FOOTER_LINKS = {
  Products: [
    { label: 'All Products',  href: '/products'              },
    { label: 'New Arrivals',  href: '/products?filter=new'   },
    { label: 'Best Sellers',  href: '/products?filter=best'  },
  ],
  Company: [
    { label: 'About Us', href: '/about'   },
    { label: 'Blog',     href: '/blog'    },
    { label: 'Careers',  href: '/careers' },
    { label: 'Contact',  href: '/contact' },
  ],
  Support: [
    { label: 'FAQ',             href: '/faq'      },
    { label: 'Shipping Policy', href: '/shipping' },
    { label: 'Return Policy',   href: '/returns'  },
    { label: 'Privacy Policy',  href: '/privacy'  },
  ],
};

const PAYMENT_METHODS = ['Visa', 'Mastercard', 'UPI', 'Net Banking'];

export default function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface-muted">
      <Container>

        {/* ── Main Grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-10 py-12 md:grid-cols-4 lg:py-16">

          {/* Brand column — full width on smallest breakpoint */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="inline-block font-display text-lg font-bold tracking-tight text-ink"
            >
              FIT N<span className="text-brand-500"> FRESH</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
              Premium health &amp; fitness products crafted for peak performance.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <SocialLink href="https://instagram.com" label="Instagram">
                <InstagramIcon />
              </SocialLink>
              <SocialLink href="https://twitter.com" label="Twitter / X">
                <TwitterIcon />
              </SocialLink>
              <SocialLink href="https://youtube.com" label="YouTube">
                <YoutubeIcon />
              </SocialLink>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink">
                {group}
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* ── Bottom Bar ───────────────────────────────────────────────── */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-surface-border py-6 sm:flex-row">
          <p className="text-xs text-ink-subtle">
            &copy; {new Date().getFullYear()} Fit N Fresh. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                className="rounded border border-surface-border bg-white px-2 py-1 text-[10px] font-medium text-ink-subtle"
              >
                {method}
              </span>
            ))}
          </div>
        </div>

      </Container>
    </footer>
  );
}

// ─── Internal Components ──────────────────────────────────────────────────────

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border bg-white text-ink-muted transition-colors duration-150 hover:border-brand-500 hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      {children}
    </a>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24"
      fill="currentColor" aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24"
      fill="currentColor" aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
