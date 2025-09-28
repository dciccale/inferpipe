import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  '/app/builder(.*)',
  '/app/api(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/app",
    "/app/((?!.+\\.[\\w]+$|_next/static|_next/image|favicon.ico).*)",
    "/app/(api|trpc)(.*)",
  ],
};

