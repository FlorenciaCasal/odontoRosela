import "server-only";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/drizzle";
import { authStates, sessions, users } from "@/lib/schema";
import {
  normalizeRedirectPath,
  REFRESH_COOKIE_NAME,
  REFRESH_TTL_SECONDS,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from "./constants";
import { maybeHashIp, randomToken, sha256 } from "./crypto";
import { GoogleProfile } from "./google";
import { SessionJwtPayload, signSessionJwt, verifySessionJwt } from "./jwt";

type CookieTarget = {
  cookies: {
    set: (name: string, value: string, options: Record<string, unknown>) => void;
    delete: (name: string) => void;
  };
};

function getCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

async function getRequestMeta() {
  const h = await headers();
  return {
    userAgent: h.get("user-agent"),
    ipHash: maybeHashIp(h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null),
  };
}

export async function upsertUserFromGoogleProfile(profile: GoogleProfile) {
  const email = profile.email.trim().toLowerCase();
  const [existing] = await db.select().from(users).where(eq(users.googleSub, profile.sub)).limit(1);

  if (existing) {
    const [updated] = await db
      .update(users)
      .set({
        email,
        fullName: profile.name ?? existing.fullName,
        pictureUrl: profile.picture ?? existing.pictureUrl,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id))
      .returning();

    return updated;
  }

  const [created] = await db
    .insert(users)
    .values({
      email,
      fullName: profile.name ?? null,
      googleSub: profile.sub,
      pictureUrl: profile.picture ?? null,
      role: "owner",
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return created;
}

export async function createAuthState(redirectTo: string) {
  const rawState = randomToken(24);

  await db.insert(authStates).values({
    stateHash: sha256(rawState),
    redirectTo: normalizeRedirectPath(redirectTo),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  return rawState;
}

export async function consumeAuthState(rawState: string) {
  const stateHash = sha256(rawState);
  const [row] = await db
    .select()
    .from(authStates)
    .where(and(eq(authStates.stateHash, stateHash), isNull(authStates.usedAt)))
    .limit(1);

  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) return null;

  await db
    .update(authStates)
    .set({ usedAt: new Date() })
    .where(eq(authStates.id, row.id));

  return row.redirectTo;
}

export async function issueSessionCookies(target: CookieTarget, user: { id: string; email: string; role: string }) {
  const sessionId = crypto.randomUUID();
  const refreshToken = randomToken(32);
  const sessionJwt = await signSessionJwt({
    sid: sessionId,
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  const meta = await getRequestMeta();

  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    sessionTokenHash: sha256(sessionJwt),
    refreshTokenHash: sha256(refreshToken),
    userAgent: meta.userAgent ?? null,
    ipHash: meta.ipHash,
    expiresAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
    refreshExpiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
    lastSeenAt: new Date(),
  });

  target.cookies.set(SESSION_COOKIE_NAME, sessionJwt, getCookieOptions(SESSION_TTL_SECONDS));
  target.cookies.set(REFRESH_COOKIE_NAME, refreshToken, getCookieOptions(REFRESH_TTL_SECONDS));
}

export async function rotateSessionByRefreshToken(refreshToken: string, target: CookieTarget) {
  const refreshHash = sha256(refreshToken);
  const now = new Date();

  const [row] = await db
    .select({
      session: sessions,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.refreshTokenHash, refreshHash),
        isNull(sessions.revokedAt),
        gt(sessions.refreshExpiresAt, now)
      )
    )
    .limit(1);

  if (!row || !row.user.isActive) {
    return null;
  }

  const newSessionId = crypto.randomUUID();
  const newRefreshToken = randomToken(32);
  const newSessionJwt = await signSessionJwt({
    sid: newSessionId,
    sub: row.user.id,
    email: row.user.email,
    role: row.user.role,
  });
  const meta = await getRequestMeta();

  await db.transaction(async (tx) => {
    await tx
      .update(sessions)
      .set({
        revokedAt: now,
        replacedBySessionId: newSessionId,
        lastSeenAt: now,
      })
      .where(eq(sessions.id, row.session.id));

    await tx.insert(sessions).values({
      id: newSessionId,
      userId: row.user.id,
      sessionTokenHash: sha256(newSessionJwt),
      refreshTokenHash: sha256(newRefreshToken),
      userAgent: meta.userAgent ?? row.session.userAgent,
      ipHash: meta.ipHash,
      expiresAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
      refreshExpiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
      lastSeenAt: now,
    });

    await tx
      .update(users)
      .set({ lastLoginAt: now, updatedAt: now })
      .where(eq(users.id, row.user.id));
  });

  target.cookies.set(SESSION_COOKIE_NAME, newSessionJwt, getCookieOptions(SESSION_TTL_SECONDS));
  target.cookies.set(REFRESH_COOKIE_NAME, newRefreshToken, getCookieOptions(REFRESH_TTL_SECONDS));

  return {
    user: row.user,
    sessionId: newSessionId,
  };
}

export async function revokeSessionByRefreshToken(refreshToken?: string | null) {
  if (!refreshToken) return;

  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(eq(sessions.refreshTokenHash, sha256(refreshToken)));
}

export function clearAuthCookies(target: CookieTarget) {
  target.cookies.delete(SESSION_COOKIE_NAME);
  target.cookies.delete(REFRESH_COOKIE_NAME);
}

export async function getCurrentSessionPayload() {
  const store = await cookies();
  const sessionToken = store.get(SESSION_COOKIE_NAME)?.value;
  const refreshToken = store.get(REFRESH_COOKIE_NAME)?.value;

  return {
    sessionToken,
    refreshToken,
  };
}

export async function getCurrentAuthenticatedUser() {
  const store = await cookies();
  const sessionToken = store.get(SESSION_COOKIE_NAME)?.value;
  const payload = await verifySessionJwt(sessionToken);

  if (!payload || !sessionToken) return null;

  const [row] = await db
    .select({
      user: users,
      session: sessions,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.id, payload.sid),
        eq(sessions.sessionTokenHash, sha256(sessionToken)),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!row || !row.user.isActive) return null;

  return {
    payload,
    user: row.user,
    session: row.session,
  };
}

export function buildLoginRedirect(pathname: string, search: string) {
  return normalizeRedirectPath(`${pathname}${search}`);
}

export type AuthenticatedSession = SessionJwtPayload;
