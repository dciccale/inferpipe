import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/app/sign-in(.*)", "/app/sign-up(.*)", "/app"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
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
