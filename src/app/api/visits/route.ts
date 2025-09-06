// import { db } from "@/lib/drizzle";
// import { visits } from "@/lib/schema";
// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   const body = await req.json();
//   await db.insert(visits).values({ patientId: body.patientId, notes: body.notes });
//   return NextResponse.json({ ok: true });
// }


// app/api/visits/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { visits, patients } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const runtime = "nodejs";

const VisitCreate = z.object({
  patientId: z.string().uuid(),
  notes: z.string().trim().min(1, "Notas requeridas"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = VisitCreate.parse(body);

    // verifica que el paciente exista (opcional pero útil)
    const [p] = await db.select({ id: patients.id }).from(patients).where(eq(patients.id, data.patientId));
    if (!p) return NextResponse.json({ ok:false, error:"Paciente no existe" }, { status: 404 });

    const [row] = await db.insert(visits).values({
      patientId: data.patientId,
      notes: data.notes,
      // date queda defaultNow()
    }).returning({ id: visits.id });

    return NextResponse.json({ ok:true, id: row.id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok:false, error: String(e) }, { status: 400 });
  }
}