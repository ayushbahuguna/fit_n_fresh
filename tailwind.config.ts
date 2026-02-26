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
        brand: {
          50:  '#EDFAF3',
          100: '#D0F4E3',
          200: '#A1E8C8',
          300: '#60D4A4',
          400: '#2EBD7C',
          500: '#1E5C38', // Primary CTA
          600: '#174A2D',
          700: '#103823',
          800: '#0B2618',
          900: '#07180F',
        },
        accent: {
          DEFAULT:    '#B8FF4A',
          hover:      '#A6EF38',
          foreground: '#0A1E08',
        },
        surface: {
          DEFAULT: '#FAFAF8',
          muted:   '#F2F4F0',
          border:  '#E0E8E3',
        },
        ink: {
          DEFAULT: '#0E1A12',
          muted:   '#48574F',
          subtle:  '#6B7B72',
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
        sm:      '0 1px 4px 0 rgba(14, 26, 18, 0.06)',
        DEFAULT: '0 2px 12px 0 rgba(14, 26, 18, 0.08)',
        md:      '0 4px 20px 0 rgba(14, 26, 18, 0.10)',
        lg:      '0 8px 32px 0 rgba(14, 26, 18, 0.13)',
        xl:      '0 16px 48px 0 rgba(14, 26, 18, 0.15)',
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
