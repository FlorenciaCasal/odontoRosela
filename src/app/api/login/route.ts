import { NextResponse } from "next/server";
import { sessionOptions, getSession } from "@/lib/session";

export async function POST(req: Request) {
  const { email, pass } = await req.json();
  if (email === process.env.ADMIN_EMAIL && pass === process.env.ADMIN_PASSWORD) {
    // set cookie via iron-session (edge-friendly)
    const res = NextResponse.json({ ok: true });
    // cookie ya la maneja iron-session tradicionalmente; aquí simplificamos:
    res.cookies.set("odonto.session", "1", { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
    return res;
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
