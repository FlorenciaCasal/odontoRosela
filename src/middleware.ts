import { NextRequest, NextResponse } from "next/server";

export const config = {
  // Interceptamos todo para poder setear cookie con ?k=ACCESS_KEY2
  matcher: ["/((?!_next|favicon.ico).*)"],
};

const COOKIE_NAME = "odonto_auth";

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // 1) Magic link: enrola el dispositivo 1 vez (?k=ACCESS_KEY2)
  const k = url.searchParams.get("k");
  if (k && k === process.env.ACCESS_KEY2) {
    const clean = new URL(req.url);
    clean.searchParams.delete("k");
    const res = NextResponse.redirect(clean);
    res.cookies.set({
      name: COOKIE_NAME,
      value: "1",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 180, // 180 días
      path: "/",
    });
    return res;
  }

  // 2) Páginas (no /api): SIEMPRE públicas
  if (!url.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // 3) API: métodos de lectura SIEMPRE públicos
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return NextResponse.next();
  }

  // 4) API: escrituras requieren cookie del magic link
  const hasCookie = req.cookies.get(COOKIE_NAME)?.value === "1";
  if (!hasCookie) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

