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
  // Use basePath when accessed through proxy (development) or when deployed standalone
  // The assetPrefix should point to the actual deployment URL in production
  basePath: isDev ? "/app" : "",
  assetPrefix: assetPrefix,
};

export default nextConfig;
