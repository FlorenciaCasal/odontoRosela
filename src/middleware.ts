import { NextRequest, NextResponse } from "next/server";
import {
  REFRESH_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  normalizeRedirectPath,
} from "@/lib/auth/constants";
import { verifySessionJwt } from "@/lib/auth/jwt";

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};

const PUBLIC_PREFIXES = [
  "/",
  "/login",
  "/auth/google/start",
  "/auth/google/callback",
  "/auth/refresh",
  "/auth/session/refresh",
  "/auth/logout",
  "/api/google/oauth/start",
  "/api/google/oauth/callback",
  "/api/patients/index",
  "/api/calendar/events/upsert-link",
  "/api/health-db",
];

function isProtectedPath(pathname: string) {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/patients") ||
    pathname.startsWith("/visits") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/api/patients") ||
    pathname.startsWith("/api/calendar") ||
    pathname.startsWith("/api/visits") ||
    pathname.startsWith("/api/uploads")
  );
}

function isProtectedApiPath(pathname: string) {
  return (
    pathname.startsWith("/api/patients") ||
    pathname.startsWith("/api/calendar") ||
    pathname.startsWith("/api/visits") ||
    pathname.startsWith("/api/uploads")
  );
}

export default async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith("/api/calendar/events/") && pathname.endsWith("/link")) {
    return NextResponse.next();
  }

  if (PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.next();
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
  const session = await verifySessionJwt(sessionToken);

  if (session) {
    return NextResponse.next();
  }

  if (isProtectedApiPath(pathname)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const redirectTo = normalizeRedirectPath(`${pathname}${search}`);
  const url = req.nextUrl.clone();

  if (refreshToken) {
    url.pathname = "/auth/session/refresh";
    url.search = `?redirect=${encodeURIComponent(redirectTo)}`;
    return NextResponse.redirect(url);
  }

  url.pathname = "/login";
  url.search = `?redirect=${encodeURIComponent(redirectTo)}`;
  return NextResponse.redirect(url);
}
