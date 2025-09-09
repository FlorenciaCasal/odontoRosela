"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function NewPatient() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [insuranceName, setInsuranceName] = useState("");
  const [insuranceNumber, setInsuranceNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const isDirty = useMemo(
    () => !!(fullName || docNumber || insuranceName || insuranceNumber || phone || email || notes),
    [fullName, docNumber, insuranceName, insuranceNumber, phone, email, notes]
  );

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        docNumber: docNumber || null,
        insuranceName: insuranceName || null,
        insuranceNumber: insuranceNumber || null,
        phone: phone || null,
        email: email || null,
        notes: notes || null,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.error ?? "Error al crear paciente");
      return;
    }
    const { id } = await res.json();
    location.href = `/patients/${id}`;
  }

  function cancel() {
    if (!isDirty || confirm("Descartar los cambios?")) {
      // volvemos a la lista de pacientes si existe, si no, atrás
      try { router.push("/patients"); } catch { history.back(); }
    }
  }

  return (
    <main className="p-6 max-w-xl mx-auto space-y-3">
      <h1 className="text-xl font-semibold">Nuevo paciente</h1>
      <form onSubmit={save} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Nombre completo *" value={fullName} onChange={e => setFullName(e.target.value)} required />
        <input className="border p-2 w-full" placeholder="DNI" value={docNumber} onChange={e => setDocNumber(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Obra social" value={insuranceName} onChange={e => setInsuranceName(e.target.value)} />
        <input className="border p-2 w-full" placeholder="N° credencial" value={insuranceNumber} onChange={e => setInsuranceNumber(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Teléfono" value={phone} onChange={e => setPhone(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <textarea className="border p-2 w-full" placeholder="Notas" value={notes} onChange={e => setNotes(e.target.value)} />
        <div className="flex gap-2 flex-col sm:flex-row">
          <button className="border px-4 py-2 rounded w-full sm:w-auto min-w-44 cursor-pointer">Guardar</button>
          <button
            type="button"
            onClick={cancel}
            className="border px-4 py-2 rounded w-full sm:w-auto min-w-44 cursor-pointer">Cancelar</button>
        </div>
      </form>
    </main>
  );
}
