// "use client";
// import { useState } from "react";

// export default function NewVisitForm({ patientId }: { patientId: string }) {
//     const [notes, setNotes] = useState("");

//     async function save(e: React.FormEvent) {
//         e.preventDefault();
//         await fetch("/api/visits", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ patientId, notes }),
//         });
//         location.href = `/patients/${patientId}`;
//     }

//     return (
//         <main className="p-6 max-w-xl mx-auto">
//             <h1 className="text-xl font-semibold mb-4">Nueva consulta</h1>
//             <form onSubmit={save} className="space-y-3">
//                 <textarea
//                     className="border p-2 w-full h-48"
//                     placeholder="Notas, evolución, tratamientos..."
//                     value={notes}
//                     onChange={(e) => setNotes(e.target.value)}
//                     required
//                 />
//                 <button className="border px-4 py-2">Guardar</button>
//             </form>
//         </main>
//     );
// }

// app/(protected)/visits/new/form-client.tsx


// app/(protected)/visits/new/form-client.tsx
"use client";
import { useState } from "react";

export default function NewVisitForm({ patientId }: { patientId: string }) {
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");
  const [debug, setDebug] = useState<any>(null);
  const [pending, setPending] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setPending(true);
    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, notes }), // ⬅️ usa el prop real
      });

      // intentá parsear JSON (puede fallar si vino vacío)
      const data = await res.json().catch(() => null);
      setDebug(data);

      if (!res.ok) {
        setErr(data?.error ?? `Error ${res.status}`);
        return;
      }

      // OK → volvemos a la ficha del paciente
      location.href = `/patients/${patientId}`;
    } catch (e) {
      setErr(String(e));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Nueva consulta</h1>
      <form onSubmit={save} className="space-y-3">
        <textarea
          className="border p-2 w-full h-48"
          placeholder="Notas, evolución, tratamientos..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          required
        />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="border px-4 py-2" disabled={pending}>
          {pending ? "Guardando..." : "Guardar"}
        </button>
        {debug && (
          <pre className="text-xs bg-gray-50 border rounded p-2 mt-2 overflow-auto">
            {JSON.stringify(debug, null, 2)}
          </pre>
        )}
      </form>
    </main>
  );
}
