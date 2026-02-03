// src/app/api/uploads/[id]/route.ts
import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { db } from "@/lib/drizzle";
import { files } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  // { params }: { params: { id: string } }
   { params }: { params: Promise<{ id: string }> }
) {
  // const fileId = params.id;
  const {id} = await params;
  const fileId = id;

  // 1. buscar archivo en DB
  const [row] = await db
    .select()
    .from(files)
    .where(eq(files.id, fileId));

  if (!row) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  // 2. borrar de Vercel Blob
  try {
    await del(row.url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  } catch (e) {
    console.error("Error borrando blob", e);
    return NextResponse.json({ error: "Error borrando archivo" }, { status: 500 });
  }

  // 3. borrar de DB
  await db.delete(files).where(eq(files.id, fileId));

  return NextResponse.json({ ok: true });
}
