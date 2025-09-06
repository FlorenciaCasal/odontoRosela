import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/drizzle";
import { files as filesTable } from "@/lib/schema";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const patientId = form.get("patientId") as string | null;
  const fileList = form.getAll("files").filter(f => f instanceof File) as File[];

  if (!patientId || fileList.length === 0) {
    return NextResponse.json({ ok: false, error: "Faltan parámetros" }, { status: 400 });
  }

  // validación opcional
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB por archivo (ajustá a gusto)
  for (const f of fileList) {
    if (f.size > MAX_SIZE) {
      return NextResponse.json({ ok: false, error: `Archivo demasiado grande: ${f.name}` }, { status: 400 });
    }
  }

  for (const file of fileList) {
    const key = `patients/${patientId}/${Date.now()}-${file.name}`;
    const blob = await put(key, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    await db.insert(filesTable).values({
      patientId,
      url: blob.url,
      filename: file.name,
      contentType: file.type || null,
      size: file.size || 0,
    });
  }

  return NextResponse.redirect(new URL(`/patients/${patientId}`, req.url));
}