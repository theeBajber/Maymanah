import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
  });

  const isLoggedIn = !!token;
  const isPortal =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/students") ||
    nextUrl.pathname.startsWith("/availability");
  const isOnboarding = nextUrl.pathname.startsWith("/onboarding");
  const isAuthPage =
    nextUrl.pathname === "/login" || nextUrl.pathname === "/register";

  if ((isPortal || isOnboarding) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/students/:path*", "/availability/:path*", "/onboarding", "/login", "/register"],
};
