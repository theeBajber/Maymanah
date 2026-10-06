import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

/**
 * Areas that need an account, as path prefixes.
 *
 * Declared once here. Writing this list in both the matcher and the checks, as
 * an earlier arrangement did, guarantees that the two can drift apart and leave
 * a route reachable that was meant to be protected.
 */
const REQUIRES_ACCOUNT = ["/dashboard", "/settings", "/courses", "/sessions", "/availability", "/messages", "/mushaf", "/revision", "/report"];

export default auth((request) => {
  const { pathname } = request.nextUrl;

  const needsAccount = REQUIRES_ACCOUNT.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (needsAccount && !request.auth) {
    // Remembers where they were going, so signing in continues rather than
    // dropping them on the dashboard.
    const target = new URL("/login", request.nextUrl);
    target.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(target);
  }

  return NextResponse.next();
});

export const config = {
  /*
   * Public paths are excluded so that the common case costs nothing. Everything
   * else passes through, and the decision for each path is made above rather
   * than repeated as a second list here.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest|robots|sitemap|opengraph-image|twitter-image|api/auth|login|register|forgot-password|reset-password|verify-email|contact|about|curriculum|stories|teach|terms|privacy|donate).*)",
  ],
};