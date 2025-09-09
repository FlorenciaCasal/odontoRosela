"use client";
import Image from "next/image";
import { useState } from "react";
import EditPatientInline from "./EditPatientInline";
import DeletePatientButton from "@/app/components/DeletePatientButton";

type Tab = "datos" | "consultas" | "archivos";
type Visit = { id: string; note?: string | null; notes?: string | null; date?: string | null };
type FileRow = { id: string; url: string; filename: string; contentType?: string | null; uploadedAt?: string | null };
type PatientSafe = {
    id: string; fullName: string; docNumber?: string | null; insuranceName?: string | null;
    insuranceNumber?: string | null; phone?: string | null; email?: string | null; notes?: string | null; createdAt?: string | null;
};

function fmt(d?: string | null) {
    if (!d) return "";
    try { return new Date(d).toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" }); }
    catch { return d; }
}

// ✅ Lista de tabs tipada (sin any)
const TABS = [
    { key: "datos", label: "Datos" },
    { key: "consultas", label: "Consultas" },
    { key: "archivos", label: "Archivos" },
] as const satisfies ReadonlyArray<{ key: Tab; label: string }>;

export default function PatientTabs({
    patient, visits, files,
}: { patient: PatientSafe; visits: Visit[]; files: FileRow[] }) {
    const [tab, setTab] = useState<"datos" | "consultas" | "archivos">("datos");
    const [isEditing, setIsEditing] = useState(false);

    return (
        // <div className="space-y-4">
        //     {/* Tabs */}
        //     <div className="inline-flex rounded-2xl overflow-hidden border">
        <div className="space-y-4">
            {/* Tabs */}
            <div className="inline-flex rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">

                {TABS.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}  // ← ya es Tab, no hace falta any
                        // className={`px-4 py-2 text-sm ${tab === key ? "bg-black text-white" : "bg-white hover:bg-gray-50"}`}
                        className={`px-4 py-2 text-sm transition ${tab === key
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-700 hover:bg-slate-50"
                            }`}

                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Contenido */}
            {/* {tab === "datos" && (
                <section className="grid gap-3 md:grid-cols-2">
                    <div className="border rounded-xl p-4"> */}
            {tab === "datos" && (
                <section className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <h2 className="text-lg font-semibold mb-1">{patient.fullName}</h2>
                        {/* <div className="text-sm text-gray-600 space-y-1"> */}
                        <div className="text-sm text-slate-600 space-y-1">

                            {patient.docNumber && <div>DNI: {patient.docNumber}</div>}
                            {patient.insuranceName && <div>Obra social: {patient.insuranceName}</div>}
                            {patient.insuranceNumber && <div>N° credencial: {patient.insuranceNumber}</div>}
                            {patient.phone && <div>Tel: {patient.phone}</div>}
                            {patient.email && <div>Email: {patient.email}</div>}
                            {/* {patient.notes && <div>Notes: {patient.notes}</div>}
                            {patient.createdAt && <div>Alta: {fmt(patient.createdAt)}</div>} */}
                            {patient.notes && <div>Notas: {patient.notes}</div>}
                            {patient.createdAt && <div className="text-slate-500">Alta: {fmt(patient.createdAt)}</div>}

                        </div>
                    </div>
                    {/* acá podés meter acciones rápidas, ej. botón imprimir */}
                    {/* <div className="border rounded-xl p-4">
                        <h3 className="font-medium mb-2">Acciones</h3>
                        <div className="flex gap-2 items-center"> */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">Acciones</h3>
                        <div className="flex flex-wrap gap-2 items-center">

                            <EditPatientInline
                                p={{
                                    id: patient.id,
                                    fullName: patient.fullName,
                                    docNumber: patient.docNumber ?? null,
                                    phone: patient.phone ?? null,
                                    email: patient.email ?? null,
                                    insuranceName: patient.insuranceName ?? null,
                                    insuranceNumber: patient.insuranceNumber ?? null,
                                    notes: patient.notes ?? null
                                }}
                                onEditingChange={setIsEditing}
                            />
                            {/* Ocultar eliminar cuando estoy editando */}
                            {!isEditing && (
                                <DeletePatientButton id={patient.id} name={patient.fullName} redirectTo="/patients" />
                            )}
                        </div>
                    </div>
                </section>
            )}

            {tab === "consultas" && (
                <section className="space-y-3">
                    {visits.length === 0 && <div className="text-sm text-gray-600">Sin consultas.</div>}
                    {visits.map(v => (
                        // <article key={v.id} className="border rounded-xl p-3">
                        //     <div className="text-xs text-gray-500">{fmt(v.date)}</div>
                        //     <p className="whitespace-pre-wrap mt-1">{v.notes ?? v.note ?? ""}</p>
                        <article key={v.id} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full border border-slate-200" />
                            <div className="flex-1">
                                <div className="text-xs text-slate-500">{fmt(v.date)}</div>
                                <p className="whitespace-pre-wrap mt-1 text-sm text-slate-800">
                                    {v.notes ?? v.note ?? ""}
                                </p>
                            </div>

                        </article>
                    ))}
                </section>
            )}

            {/* {tab === "archivos" && (
                <section className="space-y-3">
                    <form action="/api/uploads" method="post" encType="multipart/form-data" className="flex gap-2 items-center"> */}
            {tab === "archivos" && (
                <section className="space-y-4">
                    <form
                        action="/api/uploads"
                        method="post"
                        encType="multipart/form-data"
                        className="flex flex-wrap gap-2 items-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 p-4"
                    >

                        <input type="hidden" name="patientId" value={patient.id} />
                        {/* <input type="file" name="files" multiple />
                        <button className="border px-3 py-2 rounded">Subir</button> */}
                        <input className="text-sm" type="file" name="files" multiple />
                        <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
                            Subir archivos
                        </button>
                    </form>

                    {files.length === 0 && <div className="text-sm text-gray-600">Sin archivos.</div>}

                    <ul className="grid gap-3 md:grid-cols-2">
                        {files.map(f => {
                            const isImg = (f.contentType || "").startsWith("image/");
                            const isPdf = (f.contentType === "application/pdf") || f.filename?.toLowerCase().endsWith(".pdf");
                            const isVideo = (f.contentType || "").startsWith("video/");
                            return (
                                <li key={f.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                    +             <a href={f.url} target="_blank" rel="noreferrer" className="font-medium text-slate-900 hover:underline break-all">
                                        {f.filename}
                                    </a>
                                    {isImg && (
                                        <a href={f.url} target="_blank" rel="noreferrer">
                                            <Image
                                                src={f.url}
                                                alt={f.filename}
                                                className="mt-3 max-h-48 w-full rounded-xl object-contain ring-1 ring-slate-200"
                                                width={800}
                                                height={600}
                                            />
                                        </a>
                                    )}
                                    {isPdf && (
                                        <iframe src={f.url} className="mt-3 h-64 w-full rounded-xl ring-1 ring-slate-200" />
                                    )}
                                    {isVideo && (
                                        <video controls className="mt-3 max-h-64 w-full rounded-xl ring-1 ring-slate-200">
                                            <source src={f.url} type={f.contentType || "video/mp4"} />
                                        </video>
                                    )}
                                    {f.uploadedAt && <div className="mt-2 text-xs text-slate-500">{fmt(f.uploadedAt)}</div>}
                                </li>
                            );
                        })}
                    </ul>
                </section>
            )}
        </div>
    );
}
