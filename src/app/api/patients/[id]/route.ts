import { db } from "@/lib/drizzle";
import { patients } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const PatientUpdate = z.object({
    fullName: z.string().min(1).optional(),
    docNumber: z.string().trim().optional().nullable(),
    insuranceName: z.string().trim().optional().nullable(),
    insuranceNumber: z.string().trim().optional().nullable(),
    phone: z.string().trim().optional().nullable(),
    email: z.string().trim().optional().nullable(),
    notes: z.string().optional().nullable(),
});

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const [row] = await db.select().from(patients).where(eq(patients.id, id));
    return NextResponse.json(row ?? {}, { status: row ? 200 : 404 });
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const data = PatientUpdate.parse(body);

        await db.update(patients).set(data).where(eq(patients.id, id));
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ ok: false, error: String(e) }, { status: 400 });
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await db.delete(patients).where(eq(patients.id, id));
    return NextResponse.json({ ok: true });
}
