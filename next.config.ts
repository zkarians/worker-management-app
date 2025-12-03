import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true  // For mobile compatibility
  },
};

export default nextConfig;
