import { db } from "@/lib/drizzle";
import { visits } from "@/lib/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  await db.insert(visits).values({ patientId: body.patientId, notes: body.notes });
  return NextResponse.json({ ok: true });
}
