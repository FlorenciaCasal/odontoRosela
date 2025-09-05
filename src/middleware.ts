import { NextRequest, NextResponse } from "next/server";

export const config = {
  // Protege TODO menos estáticos y estos endpoints públicos
  matcher: [
    "/((?!_next|favicon.ico|api/health-db|api/google/oauth|api/patients/index).*)"
  ],
};

const COOKIE_NAME = "odonto_auth";

// Prefijos públicos (no requieren cookie)
const PUBLIC_PREFIXES = [
  "/login",
  "/api/google/oauth",
  "/api/patients/index", // ⬅️ Apps Script necesita esto libre
  "/api/health-db"
];

// Rutas protegidas (páginas y APIs internas)
function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith("/patients") ||
    pathname.startsWith("/visits") ||
    pathname.startsWith("/api")
  );
}

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Permitir públicos explícitos
  if (PUBLIC_PREFIXES.some((p) => url.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Magic link (?k=ACCESS_KEY) para enrolar dispositivo
  const k = url.searchParams.get("k");
  if (k && k === process.env.ACCESS_KEY2) { // ⬅️ usa ACCESS_KEY (no ACCESS_KEY2)
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

  // En el resto, exigir cookie
  if (isProtectedPath(url.pathname)) {
    const hasCookie = req.cookies.get(COOKIE_NAME)?.value === "1";
    if (!hasCookie) {
      const to = url.clone();
      to.pathname = "/login";
      to.search = "";
      return NextResponse.redirect(to);
    }
  }

  return NextResponse.next();
}
