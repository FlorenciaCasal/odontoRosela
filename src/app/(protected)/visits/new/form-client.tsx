"use client";
import { useState } from "react";

export default function NewVisitForm({ patientId }: { patientId: string }) {
    const [notes, setNotes] = useState("");

    async function save(e: React.FormEvent) {
        e.preventDefault();
        await fetch("/api/visits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patientId, notes }),
        });
        location.href = `/patients/${patientId}`;
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
                <button className="border px-4 py-2">Guardar</button>
            </form>
        </main>
    );
}
