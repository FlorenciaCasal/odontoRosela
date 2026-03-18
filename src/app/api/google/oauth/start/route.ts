import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL("/auth/google/start", req.url);
  const redirect = req.nextUrl.searchParams.get("redirect");
  if (redirect) {
    url.searchParams.set("redirect", redirect);
  }
  return NextResponse.redirect(url);
}
