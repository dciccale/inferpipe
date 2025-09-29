import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/builder(.*)", "/api(.*)"]);

const isPublicRoute = createRouteMatcher(["/sign-in(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  console.log("Middleware auth:", req);
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
  // if (isProtectedRoute(req)) {
  //   await auth.protect();
  // }
});

export const config = {
  matcher: [
    "/",
    "/((?!.+\\.[\\w]+$|_next/static|_next/image|favicon.ico).*)",
    "/(api|trpc)(.*)",
  ],
};
