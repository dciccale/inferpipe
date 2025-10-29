import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Following Vercel Multi Zones guide - basePath matches the rewrite path
  basePath: "/app",
  devIndicators: false,
  transpilePackages: ["@inferpipe/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
};

export default nextConfig;
