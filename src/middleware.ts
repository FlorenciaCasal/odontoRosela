import { NextRequest, NextResponse } from "next/server";

export const config = {
  // protege TODO menos estáticos, el health y el OAuth de Google
  matcher: ["/((?!_next|favicon.ico|api/health-db|api/google/oauth).*)"],
};

const COOKIE_NAME = "odonto_auth";

// rutas que queremos proteger (server y páginas)
function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith("/patients") ||
    pathname.startsWith("/visits") ||
    pathname.startsWith("/api")
  );
}

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const res = NextResponse.next();

  // 1) Si llega con ?k=ACCESS_KEY -> setear cookie y redirigir limpio
  const k = url.searchParams.get("k");
  if (k && k === process.env.ACCESS_KEY2) {
    const clean = new URL(req.url);
    clean.searchParams.delete("k");

    const resp = NextResponse.redirect(clean);
    resp.cookies.set({
      name: COOKIE_NAME,
      value: "1",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 180, // 180 días
      path: "/",
    });
    return resp;
  }

  // 2) Si la ruta es protegida y no hay cookie -> mandar al /login (por si acaso)
  if (isProtectedPath(url.pathname)) {
    const hasCookie = req.cookies.get(COOKIE_NAME)?.value === "1";
    if (!hasCookie) {
      const to = url.clone();
      to.pathname = "/login";
      to.search = ""; // limpio params
      return NextResponse.redirect(to);
    }
  }

  return res;
}
