import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fit N Fresh',
  description: 'Premium health & fitness products.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
