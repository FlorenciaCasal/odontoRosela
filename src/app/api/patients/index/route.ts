import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { patients } from "@/lib/schema";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const k = url.searchParams.get("k");

  // Protegé el endpoint con tu ACCESS_KEY (la misma del magic link)
  if (!k || k !== process.env.ACCESS_KEY2) {
    return NextResponse.json({ ok:false, error:"unauthorized" }, { status: 401 });
  }

  // Traé solo lo necesario
  const rows = await db.select({
    id: patients.id,
    fullName: patients.fullName,
    docNumber: patients.docNumber
  }).from(patients);

  return NextResponse.json({ ok:true, patients: rows }, { status: 200 });
}
