import "server-only";
import { getIronSession } from "iron-session";
import { cookies as nextCookies } from "next/headers";

export type SessionData = { authenticated?: boolean; email?: string };

export const sessionOptions = {
  password: process.env.SESSION_PASSWORD!, // 32+ chars
  cookieName: "odonto.session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    httpOnly: true,
  },
};

export async function getSession() {
  // En Next 15, cookies() es async:
  const cookieStore = await nextCookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}



