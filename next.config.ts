import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ignore Node.js APIs on client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    
    // Suppress webpack warnings
    config.ignoreWarnings = [
      { module: /node_modules\/node-fetch\/lib\/index\.js/ },
      { file: /node_modules\/node-fetch\/lib\/index\.js/ },
      /A Node\.js API is used/,
    ];

    return config;
  },
  experimental: {
    esmExternals: true,
  },
  // Disable server components warnings
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  // Supabase compatibility
  transpilePackages: ['@supabase/supabase-js'],
};

export default nextConfig;
