import { NextRequest, NextResponse } from "next/server";
import { createAuthState } from "@/lib/auth/session";
import { getGoogleStartUrl } from "@/lib/auth/google";
import { normalizeRedirectPath } from "@/lib/auth/constants";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const redirectTo = normalizeRedirectPath(req.nextUrl.searchParams.get("redirect"));
  const state = await createAuthState(redirectTo);
  return NextResponse.redirect(getGoogleStartUrl(state));
}
