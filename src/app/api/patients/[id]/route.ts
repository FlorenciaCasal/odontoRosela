import { db } from "@/lib/drizzle";
import { patients } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }   // 👈 acá
) {
    const { id } = await params;                      // 👈 y acá
    const [row] = await db.select().from(patients).where(eq(patients.id, id));
    return NextResponse.json(row ?? {}, { status: row ? 200 : 404 });
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }   // 👈 acá
) {
    const { id } = await params;                      // 👈 y acá
    const body = await req.json();
    await db.update(patients).set(body).where(eq(patients.id, id));
    return NextResponse.json({ ok: true });
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }   // 👈 acá
) {
    const { id } = await params;                      // 👈 y acá
    await db.delete(patients).where(eq(patients.id, id));
    return NextResponse.json({ ok: true });
}
