import { type NextRequest, NextResponse } from "next/server";

import { authConfig } from "@/config/auth";

function isProtectedRoute(pathname: string) {
  return authConfig.protectedRoutePrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
}

function isAuthRoute(pathname: string) {
  return authConfig.authRoutes.includes(pathname);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(
    authConfig.accessTokenCookieName,
  )?.value;

  if (!accessToken && isProtectedRoute(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (accessToken && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
