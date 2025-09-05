import { db } from "@/lib/drizzle";
import { patients, visits, files } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import CopyLinkButton from "./CopyLinkButton";

export const dynamic = "force-dynamic";

export default async function PatientDetail(
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const [p] = await db.select().from(patients).where(eq(patients.id, id));
    if (!p) return <main className="p-6">No encontrado</main>;

    const vs = await db.select().from(visits).where(eq(visits.patientId, p.id)).orderBy(desc(visits.date));
    const f = await db.select().from(files).where(eq(files.patientId, p.id)).orderBy(desc(files.uploadedAt));

    // 👇 NUEVO: generamos ambos links
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
    const cleanLink = `${base}/patients/${p.id}`; // este va al evento de Calendar
    const magicLink = `${base}/patients/${p.id}?k=${process.env.ACCESS_KEY}`; // usar SOLO para enrolar un dispositivo nuevo

    return (
        <main className="p-6 space-y-8">
            {/* Encabezado */}
            <section className="border rounded-xl p-4 grid gap-3 md:grid-cols-2">
                <div>
                    <h1 className="text-2xl font-semibold">{p.fullName}</h1>
                    <div className="mt-1 text-sm text-gray-600">
                        {p.docNumber ? <>DNI: {p.docNumber}<br /></> : null}
                        {p.phone ? <>Tel: {p.phone}<br /></> : null}
                        {p.email ? <>Email: {p.email}<br /></> : null}
                        {p.insuranceName ? <>Obra social: {p.insuranceName}<br /></> : null}
                        {p.insuranceNumber ? <>N° credencial: {p.insuranceNumber}</> : null}
                    </div>
                </div>

                {/* Bloque de link para Calendar */}
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium mb-1">Enlace para pegar en Google Calendar</div>
                    <div className="flex gap-2">
                        <input
                            className="border p-2 w-full rounded"
                            value={cleanLink}
                            readOnly
                            onFocus={(e) => e.currentTarget.select()}
                        />
                        <CopyLinkButton link={cleanLink} label="Copiar" />
                    </div>

                    {/* Opciones avanzadas (magic link) */}
                    <details className="mt-2">
                        <summary className="text-sm text-gray-600 cursor-pointer">Opciones avanzadas</summary>
                        <div className="mt-2 text-sm">
                            <p className="mb-2">
                                <b>Magic link</b> (solo para enrolar un dispositivo nuevo, una vez):
                            </p>
                            <div className="flex gap-2">
                                <input className="border p-2 w-full rounded" value={magicLink} readOnly onFocus={(e) => e.currentTarget.select()} />
                                <CopyLinkButton link={magicLink} label="Copiar" />
                            </div>
                            <p className="mt-2 text-gray-600">
                                Usalo solo cuando cambies de celular/PC o restaures el dispositivo.
                            </p>
                        </div>
                    </details>
                </div>
            </section>

            {/* Consultas */}
            <section>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-medium">Consultas</h2>
                    <Link className="border px-3 py-2 rounded" href={`/visits/new?patientId=${p.id}`}>Nueva consulta</Link>
                </div>
                <ul className="space-y-2">
                    {vs.map(v => (
                        <li key={v.id} className="border p-3 rounded">
                            <div className="text-xs text-gray-500">{new Date(v.date ?? Date.now()).toLocaleString()}</div>
                            <p className="whitespace-pre-wrap mt-1">{v.notes}</p>
                        </li>
                    ))}
                </ul>
                {vs.length === 0 && <div className="text-sm text-gray-600">Sin consultas registradas aún.</div>}
            </section>

            {/* Archivos */}
            <section>
                <h2 className="text-lg font-medium mb-2">Archivos</h2>
                <form action="/api/uploads" method="post" encType="multipart/form-data" className="flex gap-2 items-center">
                    <input type="hidden" name="patientId" value={p.id} />
                    <input type="file" name="file" required />
                    <button className="border px-3 py-2 rounded">Subir</button>
                </form>
                <ul className="mt-3 grid gap-2 md:grid-cols-2">
                    {f.map(file => (
                        <li key={file.id} className="border p-3 rounded">
                            <a className="text-blue-600 underline break-all" href={file.url} target="_blank" rel="noreferrer">
                                {file.filename}
                            </a>
                        </li>
                    ))}
                </ul>
                {f.length === 0 && <div className="text-sm text-gray-600">Sin archivos subidos.</div>}
            </section>
        </main>
    );
}