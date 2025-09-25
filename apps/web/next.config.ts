import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const appOrigin = process.env.APP_ORIGIN || "http://localhost:3001";
    console.log("appOrigin", appOrigin);
    const rewrites = [
      // Rewrite app routes - following Vercel Multi Zones guide pattern
      { source: "/app", destination: `${appOrigin}/app` },
      { source: "/app/:path*", destination: `${appOrigin}/app/:path*` },
      // Forward API routes to app deployment
      { source: "/api/:path*", destination: `${appOrigin}/api/:path*` },
    ];
    console.log("rewrites", rewrites);
    return rewrites;
  },
};

export default nextConfig;
