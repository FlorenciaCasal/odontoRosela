import { NextResponse } from "next/server";
import { google } from "googleapis";
import { db } from "@/lib/drizzle";
import { googleTokens } from "@/lib/schema";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "odonto_auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    if (!code) {
      return NextResponse.json({ ok: false, error: "code missing" }, { status: 400 });
    }

    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      process.env.GOOGLE_REDIRECT_URI!
    );

    const { tokens } = await client.getToken(code);
    const email = process.env.ADMIN_EMAIL!;
    const payload = {
      email,
      accessToken: tokens.access_token ?? "",
      refreshToken: tokens.refresh_token ?? "",
      expiryDateMs: String(tokens.expiry_date ?? 0),
    };

    // upsert manual (o tu versión con onConflict si agregaste UNIQUE)
    const existing = await db.select().from(googleTokens).where(eq(googleTokens.email, email));
    if (existing.length) {
      await db.update(googleTokens).set(payload).where(eq(googleTokens.email, email));
    } else {
      await db.insert(googleTokens).values(payload);
    }

    // ⬇️ SETEA LA COOKIE Y REDIRIGE
    const resp = NextResponse.redirect(new URL("/patients", req.url));
    resp.cookies.set({
      name: COOKIE_NAME,
      value: "1",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 180, // 180 días
      path: "/",
    });
    return resp;
  } catch (e) {
    const err = e as Error;
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
