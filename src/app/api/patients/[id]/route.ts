import { db } from "@/lib/drizzle";
import { patients } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const [row] = await db.select().from(patients).where(eq(patients.id, params.id));
  return NextResponse.json(row ?? {}, { status: row ? 200 : 404 });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  await db.update(patients).set(body).where(eq(patients.id, params.id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.delete(patients).where(eq(patients.id, params.id));
  return NextResponse.json({ ok: true });
}
