import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Following Vercel Multi Zones guide - basePath matches the rewrite path
  basePath: "/app",
  transpilePackages: ["@inferpipe/ui"],
  devIndicators: false,
};

export default nextConfig;
