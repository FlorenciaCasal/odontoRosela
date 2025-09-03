import { db } from "@/lib/drizzle";
import { patients } from "@/lib/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const [row] = await db.insert(patients).values({
    fullName: body.fullName,
    phone: body.phone ?? null,
    email: body.email ?? null,
    notes: body.notes ?? null
  }).returning({ id: patients.id });
  return NextResponse.json({ id: row.id });
}
