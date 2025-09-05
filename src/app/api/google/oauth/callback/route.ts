import { NextResponse } from "next/server";
import { google } from "googleapis";
import { db } from "@/lib/drizzle";
import { googleTokens } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.json({ ok:false, error:"code missing" }, { status: 400 });

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!, process.env.GOOGLE_CLIENT_SECRET!, process.env.GOOGLE_REDIRECT_URI!
  );
  const { tokens } = await client.getToken(code);

  const email = process.env.ADMIN_EMAIL!;
  await db.insert(googleTokens).values({
    email,
    accessToken: tokens.access_token ?? "",
    refreshToken: tokens.refresh_token ?? "",
    expiryDateMs: String(tokens.expiry_date ?? 0),
  }).onConflictDoUpdate({
    target: googleTokens.email,
    set: {
      accessToken: tokens.access_token ?? "",
      refreshToken: tokens.refresh_token ?? "",
      expiryDateMs: String(tokens.expiry_date ?? 0),
    },
  });

  return NextResponse.redirect(new URL("/patients", req.url));
}
