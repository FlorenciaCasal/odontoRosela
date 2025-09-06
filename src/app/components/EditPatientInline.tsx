"use client";
import { useState } from "react";

type PatientEditable = {
    id: string; fullName: string;
    docNumber?: string | null;
    insuranceName?: string | null;
    insuranceNumber?: string | null;
    phone?: string | null;
    email?: string | null;
    notes?: string | null;
};

export default function EditPatientInline({ p }: { p: PatientEditable }) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<PatientEditable>(p);
    const [err, setErr] = useState("");

    async function save(e: React.FormEvent) {
        e.preventDefault();
        setErr("");
        const res = await fetch(`/api/patients/${p.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => null);
            setErr(data?.error ?? `Error ${res.status}`);
            return;
        }
        location.reload(); // simple
    }

    if (!editing) {
        return (
            <button className="border px-3 py-2 rounded" onClick={() => setEditing(true)}>
                Editar paciente
            </button>
        );
    }

    return (
        <form onSubmit={save} className="space-y-2 border rounded-xl p-3">
            <input className="border p-2 w-full" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
            <div className="grid md:grid-cols-2 gap-2">
                <input className="border p-2" placeholder="DNI" value={form.docNumber ?? ""} onChange={e => setForm({ ...form, docNumber: e.target.value || null })} />
                <input className="border p-2" placeholder="Teléfono" value={form.phone ?? ""} onChange={e => setForm({ ...form, phone: e.target.value || null })} />
                <input className="border p-2" placeholder="Email" value={form.email ?? ""} onChange={e => setForm({ ...form, email: e.target.value || null })} />
                <input className="border p-2" placeholder="Obra social" value={form.insuranceName ?? ""} onChange={e => setForm({ ...form, insuranceName: e.target.value || null })} />
                <input className="border p-2" placeholder="N° credencial" value={form.insuranceNumber ?? ""} onChange={e => setForm({ ...form, insuranceNumber: e.target.value || null })} />
            </div>
            <textarea className="border p-2 w-full" placeholder="Notas" value={form.notes ?? ""} onChange={e => setForm({ ...form, notes: e.target.value || null })} />
            {err && <p className="text-red-600 text-sm">{err}</p>}
            <div className="flex gap-2">
                <button className="border px-3 py-2 rounded">Guardar</button>
                <button type="button" className="border px-3 py-2 rounded" onClick={() => setEditing(false)}>Cancelar</button>
            </div>
        </form>
    );
}
