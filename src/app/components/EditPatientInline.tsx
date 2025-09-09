"use client";
import { useState } from "react";
import IconButton from "@/app/components/ui/IconButton";
import { Pencil, Save, X } from "lucide-react";

type PatientEditable = {
    id: string; fullName: string;
    docNumber?: string | null;
    insuranceName?: string | null;
    insuranceNumber?: string | null;
    phone?: string | null;
    email?: string | null;
    notes?: string | null;
};

export default function EditPatientInline({ p, onEditingChange }: {
    p: PatientEditable;
    onEditingChange?: (editing: boolean) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<PatientEditable>(p);
    const [err, setErr] = useState("");

    function startEdit() {
        setEditing(true);
        onEditingChange?.(true);    // avisar al padre
    }

    function cancelEdit() {
        setEditing(false);
        onEditingChange?.(false);   // avisar al padre
        setForm(p);                 // opcional: resetear cambios
    }

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
        onEditingChange?.(false);   // ocultar acciones antes del reload (nice UX)
        location.reload(); // simple
    }

    // if (!editing) {
    //     return (
    //         <IconButton
    //             variant="subtle"
    //             size="md"
    //             aria-label="Editar paciente"
    //             title="Editar paciente"
    //             onClick={startEdit}
    //         >
    //             <Pencil className="h-4 w-4" />
    //         </IconButton>
    //     );
    // }
    if (!editing) {
        return (
            <button
                type="button"
                onClick={startEdit}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50"
                aria-label="Editar paciente"
                title="Editar paciente"
            >
                <Pencil className="h-4 w-4" />
                Editar paciente
            </button>
        );
    }

    return (
        <form onSubmit={save} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
                required
            />
            <div className="grid gap-2 md:grid-cols-2">
                <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400" placeholder="DNI" value={form.docNumber ?? ""} onChange={e => setForm({ ...form, docNumber: e.target.value || null })} />
                <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400" placeholder="Teléfono" value={form.phone ?? ""} onChange={e => setForm({ ...form, phone: e.target.value || null })} />
                <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400" placeholder="Email" value={form.email ?? ""} onChange={e => setForm({ ...form, email: e.target.value || null })} />
                <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400" placeholder="Obra social" value={form.insuranceName ?? ""} onChange={e => setForm({ ...form, insuranceName: e.target.value || null })} />
                <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400" placeholder="N° credencial" value={form.insuranceNumber ?? ""} onChange={e => setForm({ ...form, insuranceNumber: e.target.value || null })} />
            </div>
            <textarea className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-400" placeholder="Notas" value={form.notes ?? ""} onChange={e => setForm({ ...form, notes: e.target.value || null })} />
            {err && <p className="text-sm text-red-600">{err}</p>}
            <div className="flex gap-2">
                <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
                    <Save className="h-4 w-4" />
                    Guardar
                </button>
                <button type="button" onClick={cancelEdit} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <X className="h-4 w-4" />
                    Cancelar
                </button>
            </div>
        </form>
    );
}
