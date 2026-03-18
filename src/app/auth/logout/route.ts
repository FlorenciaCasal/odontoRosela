import { NextRequest, NextResponse } from "next/server";
import { REFRESH_COOKIE_NAME } from "@/lib/auth/constants";
import { clearAuthCookies, revokeSessionByRefreshToken } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
  await revokeSessionByRefreshToken(refreshToken);

  const res = NextResponse.json({ ok: true });
  clearAuthCookies(res);
  return res;
}
