import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV === "production" ? ".next" : ".next-dev",
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
  images: {
    formats: ["image/webp"],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.glsl$/,
      type: "asset/source",
    });
    return config;
  },
  async redirects() {
    return [
      {
        source: "/components",
        destination: "/collection",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
