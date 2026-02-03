"use client";
import { useEffect, useRef, useState } from "react";

type Row = {
  id: string;
  name: string;
  size: number;
  progress: number; // 0..100
  status: "idle" | "uploading" | "done" | "error" | "canceled";
  errorText?: string;
  xhr?: XMLHttpRequest;
};

async function maybeCompressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const MAX_DIM = 2000;      // máx ancho/alto
  const JPEG_QUALITY = 0.82; // 0..1
  const MIN_SAVINGS = 0.15;  // si no ahorra al menos 15%, usamos el original

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const { width, height } = bitmap;
  const scale = MAX_DIM / Math.max(width, height);
  const targetW = scale < 1 ? Math.round(width * scale) : width;
  const targetH = scale < 1 ? Math.round(height * scale) : height;

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) { bitmap.close?.(); return file; }

  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close?.();

  // PNG chico suele convenir dejarlo como PNG
  const preferPng = file.type === "image/png" && file.size < 800 * 1024;
  const mime = preferPng ? "image/png" : "image/jpeg";

  const blob: Blob | null = await new Promise(res =>
    canvas.toBlob(res, mime, preferPng ? undefined : JPEG_QUALITY)
  );
  if (!blob) return file;

  if (blob.size > file.size * (1 - MIN_SAVINGS)) {
    return file; // no vale la pena
  }
  const newName = file.name.replace(/\.(jpg|jpeg|png|webp|heic|heif)$/i, "") +
    (mime === "image/png" ? ".png" : ".jpg");

  return new File([blob], newName, { type: mime, lastModified: Date.now() });
}


export function UploadZoneProgress({ patientId }: { patientId: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [hover, setHover] = useState(false);

  // refs que persisten entre renders
  const xhrMapRef = useRef<Map<string, XMLHttpRequest>>(new Map());
  const queueRef = useRef<Array<{ id: string; file: File }>>([]);
  const processingRef = useRef(false);
  const currentIdRef = useRef<string | null>(null);

  // Bloquear drop global fuera de la zona (evita 405 a /patients/:id)
  useEffect(() => {
    const stop = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    window.addEventListener("dragover", stop);
    window.addEventListener("drop", stop);
    return () => {
      window.removeEventListener("dragover", stop);
      window.removeEventListener("drop", stop);
    };
  }, []);

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const incoming = Array.from(fileList).map((f, i) => {
      const id = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${i}`) + `_${f.name}`;
      return { id, name: f.name, size: f.size, file: f };
    });

    // Pintar filas (sin el File)
    setRows(prev => [
      ...incoming.map(({ id, name, size }) => ({
        id, name, size, progress: 0, status: "idle" as const,
      })),
      ...prev,
    ]);

    // Encolar archivos
    queueRef.current.push(...incoming.map(({ id, file }) => ({ id, file })));

    // Permitir volver a elegir el mismo archivo
    if (inputRef.current) inputRef.current.value = "";

    // Disparar procesamiento si no está en curso
    processNext();
  }

  function processNext() {
    if (processingRef.current) return;
    const next = queueRef.current.shift();
    if (!next) {
      // Cola vacía y nada subiendo: refrescar una vez para ver los nuevos archivos
      if (!currentIdRef.current) setTimeout(() => location.reload(), 400);
      return;
    }
    processingRef.current = true;
    currentIdRef.current = next.id;
    startUpload(next.id, next.file);
  }

  async function startUpload(id: string, file: File) {
    // (opcional) compresión primero
    try { file = await maybeCompressImage(file); } catch { }

    // ⬇️ chequeo de tamaño
    const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_SIZE_BYTES) {
      setRows(prev => prev.map(r => r.id === id ? {
        ...r,
        status: "error",
        // 👇 le mostramos un error entendible
        errorText: `Archivo demasiado grande (> ${MAX_SIZE_BYTES / 1024 / 1024} MB)`
      } : r));
      return;
    }

    setRows(prev => prev.map(r => (r.id === id ? { ...r, status: "uploading", progress: 0 } : r)));

    const fd = new FormData();
    fd.append("patientId", patientId);
    fd.append("files", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/uploads", true);

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const pct = Math.round((e.loaded / e.total) * 100);
      setRows(prev => prev.map(r => (r.id === id ? { ...r, progress: pct } : r)));
    };

    const finalize = (update: Partial<Row>) => {
      setRows(prev => prev.map(r => (r.id === id ? { ...r, ...update } : r)));
      xhrMapRef.current.delete(id);
      processingRef.current = false;
      currentIdRef.current = null;
      // Continúa con el siguiente
      processNext();
    };

    xhr.onload = () => {
      const ok = xhr.status >= 200 && xhr.status < 300;
      if (ok) {
        finalize({ status: "done", progress: 100 });
      } else {
        finalize({ status: "error", errorText: `${xhr.status} ${xhr.statusText || ""}`.trim() });
      }
    };

    xhr.onerror = () => finalize({ status: "error", errorText: "Network error" });
    xhr.onabort = () => finalize({ status: "canceled" });

    xhrMapRef.current.set(id, xhr);
    setRows(prev => prev.map(r => (r.id === id ? { ...r, xhr } : r)));
    xhr.send(fd);
  }

  function onChoose(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(e.target.files);
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    setHover(false);
    addFiles(e.dataTransfer.files);
  }

  function cancel(id: string) {
    const xhr = xhrMapRef.current.get(id);
    if (xhr) xhr.abort(); // al abortar, se llama finalize y avanza la cola
    // si está en cola (aún no subiendo), la removemos
    queueRef.current = queueRef.current.filter(item => item.id !== id);
    setRows(prev => prev.map(r => (r.id === id ? { ...r, status: "canceled" } : r)));
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id="file-input"
        className="sr-only"
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={onChoose}
      />

      <label
        htmlFor="file-input"
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setHover(true); }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setHover(false); }}
        onDrop={onDrop}
        className={`flex items-center justify-between gap-3 rounded-xl border-2 border-dashed p-4 cursor-pointer ${hover ? "border-slate-500 bg-slate-50" : "border-slate-300"
          }`}
        title="Elegí o soltá archivos; se suben automáticamente (de a uno)"
      >
        <span className="text-sm text-slate-700">
          Elegí o soltá archivos — se suben automáticamente (de a uno)
        </span>
        <span className="rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Elegir archivos
        </span>
      </label>

      {rows.length > 0 && (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{r.name}</p>
                  <p className="text-xs text-slate-500">{(r.size / 1024).toFixed(1)} KB</p>
                </div>
                <div className="text-xs">
                  {r.status === "uploading" && <span className="text-slate-600">Subiendo…</span>}
                  {r.status === "done" && <span className="text-emerald-700">Listo</span>}
                  {r.status === "error" && (
                    <span className="text-red-600">Error{r.errorText ? `: ${r.errorText}` : ""}</span>
                  )}
                  {r.status === "canceled" && <span className="text-slate-500">Cancelado</span>}
                </div>
              </div>

              <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                <div
                  className={`h-2 rounded-full ${r.status === "error" ? "bg-red-500" : "bg-slate-700"
                    }`}
                  style={{ width: `${r.progress}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-end gap-2">
                {r.status === "uploading" && (
                  <button
                    onClick={() => cancel(r.id)}
                    className="rounded border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                    type="button"
                  >
                    Cancelar
                  </button>
                )}
                {r.status === "idle" && (
                  <button
                    onClick={() => cancel(r.id)}
                    className="rounded border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                    type="button"
                  >
                    Quitar
                  </button>
                )}
              </div>
              {r.status === "error" && r.errorText && (
                <div className="mt-2 flex flex-col gap-2 text-xs text-red-600">
                  <p>
                    {r.errorText}. Sugerencia: si es una imagen, probá reducirla o exportarla a PDF.
                  </p>
                  <button
                    type="button"
                    onClick={() => setRows(prev => prev.filter(x => x.id !== r.id))}
                    className="self-end rounded border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    Aceptar
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
