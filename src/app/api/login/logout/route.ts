// import { NextResponse } from "next/server";

// export async function POST() {
//   const res = NextResponse.json({ ok: true });
//   res.cookies.set("odonto.session", "", { maxAge: 0, path: "/" });
//   return res;
// }
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("odonto_auth", "", { maxAge: 0, path: "/" });
  return res;
}

