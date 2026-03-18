import "server-only";
import { timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";

function getBearerToken(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const [scheme, token] = auth.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

export function isValidIntegrationToken(req: NextRequest) {
  const expected = process.env.INTEGRATION_TOKEN;
  if (!expected) {
    throw new Error("Missing INTEGRATION_TOKEN");
  }

  const token =
    getBearerToken(req) ??
    req.headers.get("x-integration-token");

  if (!token) return false;

  const expectedBuffer = Buffer.from(expected);
  const tokenBuffer = Buffer.from(token);

  if (expectedBuffer.length !== tokenBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, tokenBuffer);
}

export function requireIntegrationToken(req: NextRequest) {
  if (!isValidIntegrationToken(req)) {
    return false;
  }

  return true;
}

export function getCalendarEventCleanLink(req: NextRequest, eventId: string) {
  return new URL(`/calendar/event/${encodeURIComponent(eventId)}`, req.url).toString();
}
