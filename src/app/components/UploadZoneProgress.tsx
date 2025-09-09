"use client";
import { useRef, useState } from "react";

type Row = {
  id: string;
  name: string;
  size: number;
  progress: number; // 0..100
  status: "idle" | "uploading" | "done" | "error" | "canceled";
  xhr?: XMLHttpRequest;
};

export function UploadZoneProgress({ patientId }: { patientId: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [hover, setHover] = useState(false);
  // 👇 Map persistente entre renders
  const xhrMapRef = useRef<Map<string, XMLHttpRequest>>(new Map());

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const incoming = Array.from(fileList).map((f, i) => ({
      id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${i}`) + `_${f.name}`,
      name: f.name,
      size: f.size,
      progress: 0,
      status: "idle" as const,
      file: f,
    }));

    // Pintamos la lista (sin el File)
    setRows(prev => [...incoming.map(({ file, ...rest }) => rest), ...prev]);

    // Subimos cada uno
    incoming.forEach(({ file, id }) => startUpload(id, file));

    // Permitir volver a elegir el mismo archivo
    if (inputRef.current) inputRef.current.value = "";
  }

  function startUpload(id: string, file: File) {
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

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setRows(prev => prev.map(r => (r.id === id ? { ...r, status: "done", progress: 100 } : r)));
        xhrMapRef.current.delete(id); // ✅ liberar
        setTimeout(() => location.reload(), 400);
      } else {
        setRows(prev => prev.map(r => (r.id === id ? { ...r, status: "error" } : r)));
        xhrMapRef.current.delete(id);
      }
    };

    xhr.onerror = () => {
      setRows(prev => prev.map(r => (r.id === id ? { ...r, status: "error" } : r)));
      xhrMapRef.current.delete(id);
    };

    xhr.onabort = () => {
      setRows(prev => prev.map(r => (r.id === id ? { ...r, status: "canceled" } : r)));
      xhrMapRef.current.delete(id);
    };

    // guardar para poder cancelar
    xhrMapRef.current.set(id, xhr);
    setRows(prev => prev.map(r => (r.id === id ? { ...r, xhr } : r)));

    xhr.send(fd);
  }

  function onChoose(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(e.target.files);
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setHover(false);
    addFiles(e.dataTransfer.files);
  }

  function cancel(id: string) {
    const xhr = xhrMapRef.current.get(id);
    if (xhr) xhr.abort();
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id="file-input"
        className="sr-only"
        type="file"
        multiple
        onChange={onChoose}
      />
      <label
        htmlFor="file-input"
        onDragOver={(e) => { e.preventDefault(); setHover(true); }}
        onDragLeave={() => setHover(false)}
        onDrop={onDrop}
        className={`flex items-center justify-between gap-3 rounded-xl border-2 border-dashed p-4 cursor-pointer ${
          hover ? "border-slate-500 bg-slate-50" : "border-slate-300"
        }`}
        title="Elegí o soltá archivos; se suben automáticamente"
      >
        <span className="text-sm text-slate-700">
          Elegí o soltá archivos — se suben automáticamente
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
                  {r.status === "error" && <span className="text-red-600">Error</span>}
                  {r.status === "canceled" && <span className="text-slate-500">Cancelado</span>}
                </div>
              </div>

              <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                <div
                  className={`h-2 rounded-full ${r.status === "error" ? "bg-red-500" : "bg-slate-700"}`}
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
