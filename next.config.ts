import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Allow any HTTPS host for development.
    // In production, replace '**' with your CDN/storage hostname.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
