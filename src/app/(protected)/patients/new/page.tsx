"use client";
import { useState } from "react";

export default function NewPatient() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // 👈 importante
      body: JSON.stringify({ fullName, phone, email, notes }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      alert("No se pudo guardar. " + msg);
      return;
    }

    const data = await res.json();
    location.href = `/patients/${data.id}`;
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Nuevo paciente</h1>
      <form onSubmit={save} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Nombre completo"
          value={fullName} onChange={e => setFullName(e.target.value)} required />
        <input className="border p-2 w-full" placeholder="Teléfono"
          value={phone} onChange={e => setPhone(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)} />
        <textarea className="border p-2 w-full" placeholder="Notas"
          value={notes} onChange={e => setNotes(e.target.value)} />
        <button className="border px-4 py-2">Guardar</button>
      </form>
    </main>
  );
}

