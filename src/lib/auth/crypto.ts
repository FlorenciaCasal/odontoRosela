import "server-only";
import { createHash, randomBytes } from "crypto";

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function maybeHashIp(ip?: string | null) {
  if (!ip) return null;
  return sha256(ip);
}
