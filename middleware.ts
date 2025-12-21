/**
 * Middleware for route protection and role-based redirects
 *
 * - Protects /admin/* routes (requires admin role)
 * - Redirects authenticated users from /signin and / based on role
 *
 * Uses getToken from next-auth/jwt which works in Edge runtime
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from JWT (works in Edge runtime)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const role = (token?.role as string) || "user";

  // Admin routes: require admin role
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    if (role !== "admin") {
      // Non-admins get redirected to regular dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Redirect authenticated users from signin to their dashboard
  if (pathname === "/signin" && isAuthenticated) {
    const dest = role === "admin" ? "/admin/dashboard" : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
