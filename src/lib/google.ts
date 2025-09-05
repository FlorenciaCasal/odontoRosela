import { google } from "googleapis";
import { db } from "@/lib/drizzle";
import { googleTokens } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function getOAuthClient(email: string) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );
  const [t] = await db.select().from(googleTokens).where(eq(googleTokens.email, email));
  if (t) {
    client.setCredentials({
      access_token: t.accessToken,
      refresh_token: t.refreshToken || undefined,
      expiry_date: Number(t.expiryDateMs || 0) || undefined,
    });
  }
  return client;
}

export function getAuthUrl() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
  });
}
