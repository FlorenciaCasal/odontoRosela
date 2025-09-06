"use client";
import Image from "next/image";
import { useState } from "react";
import EditPatientInline from "./EditPatientInline";

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
    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="inline-flex rounded-2xl overflow-hidden border">
                {TABS.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}  // ← ya es Tab, no hace falta any
                        className={`px-4 py-2 text-sm ${tab === key ? "bg-black text-white" : "bg-white hover:bg-gray-50"}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Contenido */}
            {tab === "datos" && (
                <section className="grid gap-3 md:grid-cols-2">
                    <div className="border rounded-xl p-4">
                        <h2 className="text-lg font-semibold mb-1">{patient.fullName}</h2>
                        <div className="text-sm text-gray-600 space-y-1">
                            {patient.docNumber && <div>DNI: {patient.docNumber}</div>}
                            {patient.insuranceName && <div>Obra social: {patient.insuranceName}</div>}
                            {patient.insuranceNumber && <div>N° credencial: {patient.insuranceNumber}</div>}
                            {patient.phone && <div>Tel: {patient.phone}</div>}
                            {patient.email && <div>Email: {patient.email}</div>}
                             {patient.notes && <div>Notes: {patient.notes}</div>}
                            {patient.createdAt && <div>Alta: {fmt(patient.createdAt)}</div>}
                        </div>
                    </div>
                    {/* acá podés meter acciones rápidas, ej. botón imprimir */}
                    <div className="border rounded-xl p-4">
                        <h3 className="font-medium mb-2">Acciones</h3>
                        <div className="flex gap-2 items-center">
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
                                }} />
                        </div>
                    </div>
                </section>
            )}

            {tab === "consultas" && (
                <section className="space-y-2">
                    {visits.length === 0 && <div className="text-sm text-gray-600">Sin consultas.</div>}
                    {visits.map(v => (
                        <article key={v.id} className="border rounded-xl p-3">
                            <div className="text-xs text-gray-500">{fmt(v.date)}</div>
                            <p className="whitespace-pre-wrap mt-1">{v.notes ?? v.note ?? ""}</p>
                        </article>
                    ))}
                </section>
            )}

            {tab === "archivos" && (
                <section className="space-y-3">
                    <form action="/api/uploads" method="post" encType="multipart/form-data" className="flex gap-2 items-center">
                        <input type="hidden" name="patientId" value={patient.id} />
                        <input type="file" name="files" multiple />
                        <button className="border px-3 py-2 rounded">Subir</button>
                    </form>

                    {files.length === 0 && <div className="text-sm text-gray-600">Sin archivos.</div>}

                    <ul className="grid gap-2 md:grid-cols-2">
                        {files.map(f => {
                            const isImg = (f.contentType || "").startsWith("image/");
                            const isPdf = (f.contentType === "application/pdf") || f.filename?.toLowerCase().endsWith(".pdf");
                            const isVideo = (f.contentType || "").startsWith("video/");
                            return (
                                <li key={f.id} className="border rounded-xl p-3">
                                    <a href={f.url} target="_blank" rel="noreferrer" className="underline break-all">
                                        {f.filename}
                                    </a>
                                    {isImg && (
                                        <a href={f.url} target="_blank" rel="noreferrer">
                                            <Image src={f.url} alt={f.filename} className="mt-2 max-h-48 object-contain rounded-lg" />
                                        </a>
                                    )}
                                    {isPdf && (
                                        <iframe src={f.url} className="mt-2 w-full h-64 rounded-lg" />
                                    )}
                                    {isVideo && (
                                        <video controls className="mt-2 max-h-64 rounded-lg">
                                            <source src={f.url} type={f.contentType || "video/mp4"} />
                                        </video>
                                    )}
                                    {f.uploadedAt && <div className="text-xs text-gray-500 mt-1">{fmt(f.uploadedAt)}</div>}
                                </li>
                            );
                        })}
                    </ul>
                </section>
            )}
        </div>
    );
}
