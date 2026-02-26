'use client';

import { useState } from 'react';
import Link from 'next/link';
import Container from './Container';

const NAV_LINKS = [
  { label: 'Products', href: '/products' },
  { label: 'About',    href: '/about'    },
  { label: 'Blog',     href: '/blog'     },
] as const;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-surface-border bg-white/95 backdrop-blur-sm">
      <Container>
        <div className="flex h-16 items-center justify-between">

          {/* ── Logo ─────────────────────────────────────────────────────── */}
          <Link
            href="/"
            className="font-display text-lg font-bold tracking-tight text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-sm"
          >
            FIT N<span className="text-brand-500"> FRESH</span>
          </Link>

          {/* ── Desktop Nav ──────────────────────────────────────────────── */}
          <nav
            className="hidden items-center gap-8 md:flex"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-ink-muted transition-colors duration-150 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── Desktop Actions ───────────────────────────────────────────── */}
          <div className="hidden items-center gap-3 md:flex">
            <CartButton />
            <Link
              href="/login"
              className="text-sm font-medium text-ink-muted transition-colors duration-150 hover:text-ink"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Get Started
            </Link>
          </div>

          {/* ── Mobile Actions ────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 md:hidden">
            <CartButton />
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {isOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>

        </div>
      </Container>

      {/* ── Mobile Menu ──────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          id="mobile-menu"
          className="border-t border-surface-border bg-white md:hidden"
        >
          <Container>
            <nav
              className="flex flex-col gap-1 py-3"
              aria-label="Mobile navigation"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors duration-150 hover:bg-surface-muted hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-2 border-t border-surface-border py-3">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors duration-150 hover:bg-surface-muted hover:text-ink"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-brand-500 px-5 py-3 text-center text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-600"
              >
                Get Started
              </Link>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}

// ─── Internal Icon Components ─────────────────────────────────────────────────

function CartButton() {
  return (
    <Link
      href="/cart"
      aria-label="Shopping cart"
      className="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <svg
        width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor"
        strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    </Link>
  );
}

function MenuIcon() {
  return (
    <svg
      width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="3" y1="7"  x2="21" y2="7"  />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="17" x2="21" y2="17" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6"  x2="6"  y2="18" />
      <line x1="6"  y1="6"  x2="18" y2="18" />
    </svg>
  );
}
