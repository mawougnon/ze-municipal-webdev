import type { NextConfig } from "next";

// Next.js only needs eval in development (hot reload)
const isDev = process.env.NODE_ENV !== "production";

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
          // Content Security Policy. Fonts are self-hosted by next/font and only the
          // server talks to Resend, so neither needs an outside origin here.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self'",
              "img-src 'self' data: blob: https://*.supabase.co",
              "connect-src 'self' https://*.supabase.co",
              "frame-ancestors 'none'",
            ].join("; "),
          },
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
