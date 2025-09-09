// components/CalendarLinks.tsx
"use client";
import { useCallback } from "react";

export default function CalendarLinks({
  cleanLink,
  magicLink,
}: { cleanLink: string; magicLink: string }) {
  const selectAll = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  }, []);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert("Link copiado");
    } catch {
      window.prompt("Copiá el link:", text);
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-sm font-medium mb-1">Enlace para pegar en Google Calendar</div>

      <div className="flex gap-2 items-center mb-2">
        <input
          className="border p-2 w-full rounded"
          value={cleanLink}
          readOnly
          onFocus={selectAll}
        />
        <button type="button" className="border px-2 py-2 rounded cursor-pointer" onClick={() => copy(cleanLink)}>
          Copiar
        </button>
      </div>

      <details className="mt-1">
        <summary className="text-sm text-gray-600 cursor-pointer">Opciones avanzadas</summary>
        <div className="mt-2 text-sm">
          <p className="mb-2"><b>Magic link</b> (una vez por dispositivo):</p>
          <div className="flex gap-2 items-center">
            <input
              className="border p-2 w-full rounded"
              value={magicLink}
              readOnly
              onFocus={selectAll}
            />
            <button type="button" className="border px-2 py-2 rounded cursor-pointer" onClick={() => copy(magicLink)}>
              Copiar
            </button>
          </div>
        </div>
      </details>
    </div>
  );
}
