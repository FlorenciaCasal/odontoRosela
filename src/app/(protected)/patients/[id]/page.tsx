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
        <main className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <h1 className="text-xl font-semibold">{p.fullName}</h1>

                <div className="flex gap-2">
                    {/* Botón para Calendar (sin k) */}
                    <CopyLinkButton link={cleanLink} />
                    {/* Botón para enrolar un dispositivo nuevo (con k) */}
                    <CopyLinkButton link={magicLink} label="Magic link (enrolar)" />
                </div>
            </div>

            <section>
                <h2 className="font-medium mb-2">Consultas</h2>
                <Link className="border px-2 py-1" href={`/visits/new?patientId=${p.id}`}>Nueva consulta</Link>
                <ul className="mt-3 space-y-2">
                    {vs.map(v => (
                        <li key={v.id} className="border p-3 rounded">
                            <div className="text-sm text-gray-600">{new Date(v.date ?? Date.now()).toLocaleString()}</div>
                            <p className="whitespace-pre-wrap">{v.notes}</p>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h2 className="font-medium mb-2">Archivos</h2>
                <form action="/api/uploads" method="post" encType="multipart/form-data" className="flex gap-2 items-center">
                    <input type="hidden" name="patientId" value={p.id} />
                    <input type="file" name="file" required />
                    <button className="border px-2 py-1">Subir</button>
                </form>
                <ul className="mt-3 space-y-2">
                    {f.map(file => (
                        <li key={file.id} className="border p-3 rounded">
                            <a className="text-blue-600 underline" href={file.url} target="_blank" rel="noreferrer">{file.filename}</a>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}
