import { db } from "@/lib/drizzle";
import { patients } from "@/lib/schema";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "drizzle-orm";

const PatientCreate = z.object({
  fullName: z.string().min(1),
  docNumber: z.string().trim().optional().nullable(),
  insuranceName: z.string().trim().optional().nullable(),
  insuranceNumber: z.string().trim().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  email: z.string().trim().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = PatientCreate.parse(body);

    // ❗ chequeo por nombre exacto (case-insensitive, espacios normalizados)
    const fullNameNorm = data.fullName.trim().replace(/\s+/g, " ");
    const [dup] = await db.select({ id: patients.id })
      .from(patients)
      .where(sql`lower(${patients.fullName}) = ${fullNameNorm.toLowerCase()}`)
      .limit(1);

    if (dup) {
      return NextResponse.json(
        { ok: false, error: "Ya existe un paciente con ese nombre" },
        { status: 409 }
      );
    }

    const [row] = await db.insert(patients).values({
      fullName: data.fullName,
      docNumber: data.docNumber ?? null,
      insuranceName: data.insuranceName ?? null,
      insuranceNumber: data.insuranceNumber ?? null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      notes: data.notes ?? null,
    }).returning({ id: patients.id });

    return NextResponse.json({ id: row.id });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 400 });
  }
}
