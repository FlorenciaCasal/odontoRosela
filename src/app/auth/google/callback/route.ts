import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  fetchGoogleProfile,
  isAllowedGoogleEmail,
} from "@/lib/auth/google";
import {
  consumeAuthState,
  issueSessionCookies,
  upsertUserFromGoogleProfile,
} from "@/lib/auth/session";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/auth/constants";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(new URL("/login?error=oauth_missing_params", req.url));
  }

  const redirectTo = await consumeAuthState(state);
  if (!redirectTo) {
    return NextResponse.redirect(new URL("/login?error=oauth_invalid_state", req.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const profile = await fetchGoogleProfile(tokens.access_token);

    if (!profile.email || !profile.email_verified || !isAllowedGoogleEmail(profile.email)) {
      return NextResponse.redirect(new URL("/login?error=oauth_email_not_allowed", req.url));
    }

    const user = await upsertUserFromGoogleProfile(profile);
    const res = NextResponse.redirect(new URL(redirectTo || DEFAULT_LOGIN_REDIRECT, req.url));

    await issueSessionCookies(res, {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return res;
  } catch {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }
}
