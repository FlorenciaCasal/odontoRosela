import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";

export const config = {
  // Interceptamos todo para poder setear cookie con ?k=ACCESS_KEY2
  matcher: ["/((?!_next|favicon.ico).*)"],
};

const COOKIE_NAME = "odonto_auth";
const ACCESS_KEY = process.env.ACCESS_KEY2!;
const SESSION_SECRET = new TextEncoder().encode(process.env.SESSION_SECRET!);

const PUBLIC_PREFIXES = ["/login", "/api/google/oauth", "/api/patients/index", "/api/health-db"];

function isProtectedPath(pathname: string) {
  return pathname.startsWith("/patients") || pathname.startsWith("/visits") || pathname.startsWith("/api");
}

async function makeSessionToken() {
  return await new SignJWT({ role: "owner" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("180d")
    .sign(SESSION_SECRET);
}

async function isValidSession(token?: string) {
  if (!token) return false;
  try { await jwtVerify(token, SESSION_SECRET); return true; } catch { return false; }
}


export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => url.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // auto-enrolar por ?k=ACCESS_KEY2 (no cambia tu Apps Script)
  const k = url.searchParams.get("k");
  if (k && k === ACCESS_KEY) {
    const clean = new URL(req.url);
    clean.searchParams.delete("k");

    const resp = NextResponse.redirect(clean);
    const token = await makeSessionToken();
    resp.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 180, // 180 días
    });
    return resp;
  }

  if (isProtectedPath(url.pathname)) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!(await isValidSession(token))) {
      const to = url.clone();
      to.pathname = "/login"; // si ya no usás /login, podés redirigir a "/"
      to.search = "";
      return NextResponse.redirect(to);
    }
  }

  return NextResponse.next();
}