import { db } from "@/lib/drizzle";
import { patients } from "@/lib/schema";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // asegura Node (útil si usás crypto y pool)

export async function POST(req: Request) {
  try {
    // 1) Parseo robusto
    const body = await req.json();
    if (!body?.fullName || typeof body.fullName !== "string") {
      return NextResponse.json({ ok: false, error: "fullName requerido" }, { status: 400 });
    }

    // 2) Genero el ID acá (evito depender de gen_random_uuid() en la DB)
    const id = crypto.randomUUID();

    // 3) Inserto (normalizo nulls)
    const [row] = await db
      .insert(patients)
      .values({
        id,
        fullName: body.fullName,
        phone: body.phone ?? null,
        email: body.email ?? null,
        notes: body.notes ?? null,
      })
      .returning({ id: patients.id });

    return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
  } catch (e) {
    const err = e as Error;
    console.error("API /patients POST ERROR:", err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

