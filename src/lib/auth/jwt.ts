import { jwtVerify, SignJWT } from "jose";
import { SESSION_TTL_SECONDS } from "./constants";

export type SessionJwtPayload = {
  sid: string;
  sub: string;
  email: string;
  role: string;
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing SESSION_SECRET");
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionJwt(payload: SessionJwtPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function verifySessionJwt(token?: string) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    return payload as unknown as SessionJwtPayload;
  } catch {
    return null;
  }
}
