import { db } from "@/lib/drizzle";
import { patients } from "@/lib/schema";
import { NextResponse } from "next/server";
import { z } from "zod";

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
