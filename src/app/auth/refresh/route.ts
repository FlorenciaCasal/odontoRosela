import { NextRequest, NextResponse } from "next/server";
import { REFRESH_COOKIE_NAME, normalizeRedirectPath } from "@/lib/auth/constants";
import { clearAuthCookies, rotateSessionByRefreshToken } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
  const redirectTo = normalizeRedirectPath(req.nextUrl.searchParams.get("redirect"));

  if (!refreshToken) {
    return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(redirectTo)}`, req.url));
  }

  const res = NextResponse.redirect(new URL(redirectTo, req.url));
  const rotated = await rotateSessionByRefreshToken(refreshToken, res);

  if (!rotated) {
    clearAuthCookies(res);
    return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(redirectTo)}`, req.url));
  }

  return res;
}
