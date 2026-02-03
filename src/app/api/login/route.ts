// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   const { email, pass } = await req.json();
//   if (email === process.env.ADMIN_EMAIL && pass === process.env.ADMIN_PASSWORD) {
//     // set cookie via iron-session (edge-friendly)
//     const res = NextResponse.json({ ok: true });
//     // cookie ya la maneja iron-session tradicionalmente; aquí simplificamos:
//     res.cookies.set("odonto.session", "1", { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
//     return res;
//   }
//   return NextResponse.json({ ok: false }, { status: 401 });
// }
import { NextResponse } from "next/server";
import { SignJWT } from "jose";

const SESSION_SECRET = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function POST(req: Request) {
  const { email, pass } = await req.json();

  if (
    email === process.env.ADMIN_EMAIL &&
    pass === process.env.ADMIN_PASSWORD
  ) {
    const token = await new SignJWT({ role: "owner" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("180d")
      .sign(SESSION_SECRET);

    const res = NextResponse.json({ ok: true });

    res.cookies.set("odonto_auth", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 180,
    });

    return res;
  }

  return NextResponse.json({ ok: false }, { status: 401 });
}

