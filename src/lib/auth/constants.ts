export const SESSION_COOKIE_NAME = "odonto_session";
export const REFRESH_COOKIE_NAME = "odonto_refresh";

export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12h
export const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30; // 30d
export const AUTH_STATE_TTL_SECONDS = 60 * 10; // 10m

export const DEFAULT_LOGIN_REDIRECT = "/patients";

export function isSecureCookie(): boolean {
  return process.env.NODE_ENV === "production";
}

export function isSafeRedirectPath(value?: string | null): boolean {
  if (!value) return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;
  return true;
}

export function normalizeRedirectPath(value?: string | null): string {
  return isSafeRedirectPath(value) ? (value as string) : DEFAULT_LOGIN_REDIRECT;
}
