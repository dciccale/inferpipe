import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure for both development (through proxy) and production (standalone)
  basePath: process.env.NODE_ENV === "development" ? "/app" : "",
  assetPrefix: process.env.NODE_ENV === "development" ? "/app" : "",
};

export default nextConfig;
