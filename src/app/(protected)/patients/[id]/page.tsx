import { db } from "@/lib/drizzle";
import { patients, visits, files } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import CopyLinkButton from "./CopyLinkButton";

export const dynamic = "force-dynamic";

export default async function PatientDetail(
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const [p] = await db.select().from(patients).where(eq(patients.id, id));
        if (!p) return <main className="p-6">No encontrado</main>;

        const vs = await db.select().from(visits).where(eq(visits.patientId, p.id)).orderBy(desc(visits.date));
        const f = await db.select().from(files).where(eq(files.patientId, p.id)).orderBy(desc(files.uploadedAt));

        const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
        const cleanLink = `${base}/patients/${p.id}`;
        const magicLink = `${base}/patients/${p.id}?k=${encodeURIComponent(process.env.ACCESS_KEY2 ?? "")}`;

        return (
            <main className="p-6 space-y-8">
                <section className="border rounded-xl p-4 grid gap-3 md:grid-cols-2">
                    <div>
                        <h1 className="text-2xl font-semibold">{p.fullName}</h1>
                        <div className="mt-1 text-sm text-gray-600">
                            {p.docNumber ? <>DNI: {p.docNumber}<br /></> : null}
                            {p.phone ? <>Tel: {p.phone}<br /></> : null}
                            {p.email ? <>Email: {p.email}<br /></> : null}
                            {/* Estos campos no existen en tu schema; los dejo defensivos */}
                            {(p as any).insuranceName ? <>Obra social: {(p as any).insuranceName}<br /></> : null}
                            {(p as any).insuranceNumber ? <>N° credencial: {(p as any).insuranceNumber}</> : null}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm font-medium mb-1">Enlace para pegar en Google Calendar</div>
                        <div className="flex gap-2">
                            <input className="border p-2 w-full rounded" value={cleanLink} readOnly onFocus={(e) => e.currentTarget.select()} />
                            <CopyLinkButton link={cleanLink} label="Copiar" />
                        </div>
                        <details className="mt-2">
                            <summary className="text-sm text-gray-600 cursor-pointer">Opciones avanzadas</summary>
                            <div className="mt-2 text-sm">
                                <p className="mb-2"><b>Magic link</b> (una vez por dispositivo):</p>
                                <div className="flex gap-2">
                                    <input className="border p-2 w-full rounded" value={magicLink} readOnly onFocus={(e) => e.currentTarget.select()} />
                                    <CopyLinkButton link={magicLink} label="Copiar" />
                                </div>
                            </div>
                        </details>
                    </div>
                </section>

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
    } catch (e: any) {
        console.error("PatientDetail error:", e);
        return (
            <main className="p-6">
                <h1 className="text-xl font-semibold">Error en ficha</h1>
                <pre className="mt-3 text-sm whitespace-pre-wrap">{String(e?.stack || e?.message || e)}</pre>
            </main>
        );
    }
}
