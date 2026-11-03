import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Do not announce the framework in every response
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      // Pages get a strict CSP with a nonce from proxy.ts. API answers are JSON and
      // never need to load or run anything.
      {
        source: "/api/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "default-src 'none'; frame-ancestors 'none'" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          // Prevents clickjacking attacks
          { key: "X-Frame-Options", value: "DENY" },
          // Prevents MIME type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Forces HTTPS
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Controls referrer information
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions policy
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
