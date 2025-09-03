import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/drizzle";
import { files } from "@/lib/schema";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File;
  const patientId = form.get("patientId") as string;

  if (!file || !patientId) return NextResponse.json({ ok: false }, { status: 400 });

  const blob = await put(`patients/${patientId}/${file.name}`, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN
  });

  await db.insert(files).values({
    patientId,
    url: blob.url,
    filename: file.name,
    contentType: file.type,
    size: file.size
  });

  return NextResponse.redirect(new URL(`/patients/${patientId}`, req.url));
}
