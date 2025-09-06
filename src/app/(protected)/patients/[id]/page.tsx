import { db } from "@/lib/drizzle";
import { patients, visits, files } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import PatientTabs from "@/app/components/PatientTabs";
import { notFound } from "next/navigation";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Patient = typeof patients.$inferSelect;
type Visit = typeof visits.$inferSelect;
type FileRow = typeof files.$inferSelect;

function getErr(e: unknown) {
    if (e instanceof Error) return e.stack || e.message;
    if (typeof e === "string") return e;
    try { return JSON.stringify(e); } catch { return String(e); }
}

function isUuidLike(s: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}


export default async function PatientDetail(
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!id || !isUuidLike(id)) notFound();

    try {
        // Paciente
        let p: Patient | undefined;
        try {
            const [row] = await db.select().from(patients).where(eq(patients.id, id));
            p = row;
        } catch (e) {
            console.error("DB error patients:", e);
            return (
                <main className="p-6">
                    <h1 className="text-xl font-semibold">Error consultando paciente</h1>
                    <pre className="mt-3 text-sm whitespace-pre-wrap">{getErr(e)}</pre>
                </main>
            );
        }
        if (!p) notFound();

        // Visitas (no romper si falla)
        let vs: Visit[] = [];
        try {
            vs = await db
                .select()
                .from(visits)
                .where(eq(visits.patientId, p.id))
                .orderBy(desc(visits.date));
        } catch (e) {
            console.error("DB error visits:", e);
            vs = [];
        }

        // Archivos (no romper si falla)
        let fs: FileRow[] = [];
        try {
            fs = await db
                .select()
                .from(files)
                .where(eq(files.patientId, p.id))
                .orderBy(desc(files.uploadedAt));
        } catch (e) {
            console.error("DB error files:", e);
            fs = [];
        }

        const safe = {
            id: p.id,
            fullName: p.fullName,
            docNumber: p.docNumber ?? null,
            insuranceName: p.insuranceName ?? null,
            insuranceNumber: p.insuranceNumber ?? null,
            phone: p.phone ?? null,
            email: p.email ?? null,
            notes: p.notes ?? null,
            createdAt: p.createdAt?.toISOString?.() ?? null,
        };
        const safeVisits = vs.map(v => ({
            id: v.id,
            notes: v.notes ?? null,
            date: v.date?.toISOString?.() ?? null,
        }));
        const safeFiles = fs.map(f => ({
            id: f.id,
            url: f.url,
            filename: f.filename,
            contentType: f.contentType ?? null,
            uploadedAt: f.uploadedAt?.toISOString?.() ?? null,
        }));


        return (
            <main className="p-6 space-y-8">
                {/* encabezado con links a Calendar si querés mantenerlo */}
                <PatientTabs patient={safe} visits={safeVisits} files={safeFiles} />
            </main>
        );
    } catch (e) {
        return (
            <main className="p-6">
                <h1 className="text-xl font-semibold">Error en ficha (atrapado)</h1>
                <pre className="mt-3 text-sm whitespace-pre-wrap">{getErr(e)}</pre>
            </main>
        );
    }
}