import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use basePath when accessed through proxy (development) or when deployed standalone
  // The assetPrefix should point to the actual deployment URL in production
  basePath: process.env.NODE_ENV === "development" ? "/app" : "",
  assetPrefix:
    process.env.NODE_ENV === "development"
      ? "/app"
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "",
};

export default nextConfig;
