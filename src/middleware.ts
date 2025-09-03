import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIX = "/";

export async function middleware(req: NextRequest) {
  // Deja públicas solo /login y /api/login
  const url = new URL(req.url);
  if (url.pathname.startsWith("/login") || url.pathname.startsWith("/api/login")) {
    return NextResponse.next();
  }
  const session = req.cookies.get("odonto.session");
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|login|api/login).*)"]
};
