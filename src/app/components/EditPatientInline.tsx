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

    if (!editing) {
        return (
            <button
                type="button"
                onClick={startEdit}
                // className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50 w-auto cursor-pointer"
                className="
  inline-flex items-center gap-2
  rounded-lg
  text-base sm:text-sm
  px-3 py-2 sm:px-4 sm:py-2.5
  font-medium
  bg-primary text-white
  font-medium shadow-sm
  hover:bg-blue-700
  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50
  w-auto cursor-pointer
"

                aria-label="Editar paciente"
            // title="Editar paciente"
            >
                <Pencil className="h-4 w-4" />
                {/* Editar paciente */}
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
            {err && <p className="text-red-600 text-sm">{err}</p>}
            <div className="flex gap-2">
                <IconButton type="submit" variant="primary" aria-label="Guardar paciente" className="min-w-44">
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Guardar</span>

                </IconButton>

                <IconButton type="button" variant="ghost" aria-label="Cancelar edición" onClick={cancelEdit} className="min-w-44">
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Cancelar</span>
                </IconButton>
            </div>
        </form>
    );
}
