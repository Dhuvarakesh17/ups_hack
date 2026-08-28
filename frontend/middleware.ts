import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/booking",
  "/analytics",
  "/settings",
  "/profile",
  "/drafts",
  "/shipments"
];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected) {
    const sessionCookie =
      request.cookies.get("better-auth.session_token") ||
      request.cookies.get("session_token") ||
      request.cookies.get("better-auth.token");

    const isDevelopment = process.env.NODE_ENV !== "production";

    if (!sessionCookie && !isDevelopment) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/booking/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/drafts/:path*",
    "/shipments/:path*"
  ]
};
