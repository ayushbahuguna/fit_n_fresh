import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // ─── Brand Color System ────────────────────────────────────────────────
      colors: {
        primary: {
          DEFAULT: '#3A0A4A', // deep purple — navbar, footer, strong sections
          light:   '#5B1E70', // medium purple — hover states, secondary fills
          dark:    '#2A0636', // deepest — active/pressed states
        },
        accent: {
          DEFAULT: '#D4AF37', // gold — primary CTAs and highlights only
          light:   '#E7C76B', // light gold — hover
          dark:    '#B8941E', // deep gold — active
        },
        surface: {
          DEFAULT: '#F7F3F9', // background-light
          muted:   '#EFE9F4', // subtle fills
          border:  '#DDD0E8', // borders on light backgrounds
        },
        ink: {
          DEFAULT: '#1A1A1A', // text-primary
          muted:   '#4A4A5A', // secondary text
          subtle:  '#7A7A8A', // tertiary text
          inverse: '#FFFFFF', // text-inverse (on dark bg)
        },
      },

      // ─── Font Families ─────────────────────────────────────────────────────
      fontFamily: {
        sans:    ['var(--font-inter)',  'system-ui', 'sans-serif'],
        display: ['var(--font-syne)',   'system-ui', 'sans-serif'],
      },

      // ─── Layout ────────────────────────────────────────────────────────────
      maxWidth: {
        container: '1280px',
      },

      // ─── Shadows (tinted, layered) ─────────────────────────────────────────
      boxShadow: {
        sm:      '0 1px 4px 0 rgba(58, 10, 74, 0.06)',
        DEFAULT: '0 2px 12px 0 rgba(58, 10, 74, 0.08)',
        md:      '0 4px 20px 0 rgba(58, 10, 74, 0.10)',
        lg:      '0 8px 32px 0 rgba(58, 10, 74, 0.13)',
        xl:      '0 16px 48px 0 rgba(58, 10, 74, 0.15)',
      },

      // ─── Transitions ───────────────────────────────────────────────────────
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
