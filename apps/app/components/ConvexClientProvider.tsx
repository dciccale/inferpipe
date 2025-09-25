"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // Check if Convex URL is configured
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  
  if (!convexUrl) {
    // Show helpful error message if Convex is not configured
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Convex Not Configured</h2>
          <p className="text-gray-700 mb-4">
            Please set up your Convex environment variables:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Create <code className="bg-gray-100 px-1 rounded">.env.local</code> in the root directory</li>
            <li>Add <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud</code></li>
            <li>Run <code className="bg-gray-100 px-1 rounded">cd packages/backend && npx convex dev</code> to get your URL</li>
          </ol>
          <p className="text-xs text-gray-500 mt-4">
            See ENV_SETUP.md for detailed instructions.
          </p>
        </div>
      </div>
    );
  }

  const convex = new ConvexReactClient(convexUrl);
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
