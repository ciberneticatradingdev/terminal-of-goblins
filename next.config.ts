import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Skip static prerendering entirely — everything is dynamic
  experimental: {
    // Avoid prerender errors on Railway
  },
};

export default nextConfig;
