import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/drizzle";
import { files as filesTable } from "@/lib/schema";

export const runtime = "nodejs";

// sanea el nombre para almacenarlo en DB (solo para mostrar), no para la URL
function displayName(original: string) {
  const base = (original || "archivo").replace(/[\r\n]+/g, " ").trim();
  return base.slice(0, 120);
}

// intenta inferir extensión a partir del nombre; si no, por MIME
function inferExt(file: File) {
  const n = file.name?.toLowerCase() || "";
  const byName = n.includes(".") ? n.slice(n.lastIndexOf(".") + 1) : "";
  if (byName) return byName;

  const t = (file.type || "").toLowerCase();
  if (t.startsWith("image/")) return t.split("/")[1] || "img";
  if (t === "application/pdf") return "pdf";
  if (t.startsWith("video/")) return t.split("/")[1] || "mp4";
  return "bin";
}

export async function POST(req: Request) {
  const form = await req.formData();
  const patientId = form.get("patientId") as string | null;

  // múltiples archivos bajo name="files"
  const fileList = form.getAll("files").filter(f => f instanceof File) as File[];

  if (!patientId || fileList.length === 0) {
    return NextResponse.json({ ok: false, error: "Faltan parámetros" }, { status: 400 });
  }

  // límites básicos
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB c/u
  const MAX_FILES = 12;
  if (fileList.length > MAX_FILES) {
    return NextResponse.json({ ok: false, error: `Demasiados archivos (máx ${MAX_FILES})` }, { status: 400 });
  }

  const ALLOWED = ["image/", "application/pdf", "video/"];
  for (const f of fileList) {
    if (f.size > MAX_SIZE) {
      return NextResponse.json({ ok: false, error: `Archivo demasiado grande: ${f.name}` }, { status: 400 });
    }
    const t = f.type || "";
    if (!ALLOWED.some(prefix => t === prefix || t.startsWith(prefix))) {
      return NextResponse.json({ ok: false, error: `Tipo no permitido: ${f.name} (${t || "desconocido"})` }, { status: 400 });
    }
  }

  // subidas en paralelo con nombres imposibles de adivinar (no exponemos el original)
  const results = await Promise.all(
    fileList.map(async (file) => {
      const ext = inferExt(file);
      const key = `patients/${patientId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

      const blob = await put(key, file, {
        access: "public", // hoy Vercel Blob solo soporta público
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      await db.insert(filesTable).values({
        patientId,
        url: blob.url,                      // URL pública difícil de adivinar
        filename: displayName(file.name),   // mostramos el nombre original “limpio”
        contentType: file.type || null,
        size: file.size || 0,
      });

      return blob.url;
    })
  );

  // volvemos a la ficha
  return NextResponse.redirect(new URL(`/patients/${patientId}`, req.url));
}
