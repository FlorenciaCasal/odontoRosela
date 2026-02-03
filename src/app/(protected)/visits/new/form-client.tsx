"use client";
import { useState } from "react";

export default function NewVisitForm({ patientId }: { patientId: string }) {
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");
  const [pending, setPending] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setPending(true);
    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, notes }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setErr(data?.error ?? `Error ${res.status}`);
        return;
      }
      location.href = `/patients/${patientId}`;
    } catch (e) {
      setErr(String(e));
    } finally {
      setPending(false);
    }
  }

  // return (
  //   <main className="p-6 max-w-xl mx-auto">
  //     <h1 className="text-xl font-semibold mb-4">Nueva consulta</h1>
  //     <form onSubmit={save} className="space-y-3">
  //       <textarea
  //         className="border p-2 w-full h-48"
  //         placeholder="Notas, evolución, tratamientos..."
  //         value={notes}
  //         onChange={(e) => setNotes(e.target.value)}
  //         required
  //       />
  //       {err && <p className="text-red-600 text-sm">{err}</p>}
  //       <button className="border px-4 py-2 w-full sm:w-auto cursor-pointer" disabled={pending}>
  //         {pending ? "Guardando..." : "Guardar"}
  //       </button>
  //     </form>
  //   </main>
  // );
  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-xl card p-5 sm:p-6">
        <h1 className="text-xl font-semibold">Nueva consulta</h1>
        <p className="text-sm muted mt-1">Registrá evolución, tratamientos y observaciones.</p>

        <form onSubmit={save} className="space-y-3 mt-5">
          <textarea
            className="input h-44"
            placeholder="Notas, evolución, tratamientos..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
          />
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <button className="btn-primary w-full" disabled={pending}>
            {pending ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </div>
    </main>
  );

}

