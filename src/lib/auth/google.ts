import "server-only";
import { AUTH_STATE_TTL_SECONDS } from "./constants";

export type GoogleProfile = {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

export function getGoogleRedirectUri() {
  return getRequiredEnv("GOOGLE_REDIRECT_URI");
}

export function getGoogleStartUrl(state: string) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", getRequiredEnv("GOOGLE_CLIENT_ID"));
  url.searchParams.set("redirect_uri", getGoogleRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeCodeForTokens(code: string) {
  const body = new URLSearchParams({
    code,
    client_id: getRequiredEnv("GOOGLE_CLIENT_ID"),
    client_secret: getRequiredEnv("GOOGLE_CLIENT_SECRET"),
    redirect_uri: getGoogleRedirectUri(),
    grant_type: "authorization_code",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Google token exchange failed");
  }

  return res.json() as Promise<{ access_token: string }>;
}

export async function fetchGoogleProfile(accessToken: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Google userinfo failed");
  }

  return res.json() as Promise<GoogleProfile>;
}

export function getAllowedGoogleEmails() {
  const configured = process.env.ALLOWED_GOOGLE_EMAILS ?? process.env.ADMIN_EMAIL ?? "";
  return configured
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedGoogleEmail(email: string) {
  const allowed = getAllowedGoogleEmails();
  return allowed.length > 0 && allowed.includes(email.trim().toLowerCase());
}

export function getAuthStateExpiry() {
  return new Date(Date.now() + AUTH_STATE_TTL_SECONDS * 1000);
}
