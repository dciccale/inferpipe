import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@turbotemplate/ui"],
  async rewrites() {
    const APP_ORIGIN = process.env.APP_ORIGIN ?? "";
    return [
      // Rewrite app routes - following Vercel Multi Zones guide pattern
      { source: "/app", destination: `${APP_ORIGIN}/app` },
      { source: "/app/:path*", destination: `${APP_ORIGIN}/app/:path*` },
    ];
  },
};

export default nextConfig;
