import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const appOrigin = process.env.APP_ORIGIN || "http://localhost:3001";
    return [
      { source: "/app", destination: `${appOrigin}/` },
      { source: "/app/:path*", destination: `${appOrigin}/:path*` },
      // if you also want to forward product APIs
      { source: "/api/:path*", destination: `${appOrigin}/api/:path*` },
    ];
  },
};

export default nextConfig;
