import type { NextConfig } from "next";

const APP_ORIGIN = process.env.APP_ORIGIN ?? "";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Rewrite app routes - following Vercel Multi Zones guide pattern
      { source: "/app", destination: `${APP_ORIGIN}/app` },
      { source: "/app/:path*", destination: `${APP_ORIGIN}/app/:path*` },
      // Forward API routes to app deployment
      { source: "/api/:path*", destination: `${APP_ORIGIN}/api/:path*` },
    ];
  },
};

export default nextConfig;
