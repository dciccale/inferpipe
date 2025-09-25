import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const vercelUrl = process.env.VERCEL_URL;
const assetPrefix = isDev 
  ? "/app" 
  : vercelUrl 
    ? `https://${vercelUrl}` 
    : "";

// Debug logging
console.log("🔧 App Config Debug:");
console.log("  NODE_ENV:", process.env.NODE_ENV);
console.log("  VERCEL_URL:", vercelUrl);
console.log("  isDev:", isDev);
console.log("  basePath:", isDev ? "/app" : "");
console.log("  assetPrefix:", assetPrefix);

const nextConfig: NextConfig = {
  // According to Vercel Multi Zones guide, basePath should match the rewrite path
  // This app is served under /app via rewrites, so basePath should be /app
  basePath: "/app",
  // No assetPrefix needed - Next.js will handle this with basePath
  
  // Add CORS headers to allow access from inferpipe.ai
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://inferpipe.ai",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
