import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "legacy_login_disabled",
      message: "El login por email/contraseña fue reemplazado por Google OAuth.",
    },
    { status: 410 }
  );
}
