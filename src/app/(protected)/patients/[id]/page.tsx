import { db } from "@/lib/drizzle";
import { patients, visits, files } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import CalendarLinks from "@/app/components/CalendarLinks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Patient = typeof patients.$inferSelect;
type Visit   = typeof visits.$inferSelect;
type FileRow = typeof files.$inferSelect;

function getErr(e: unknown) {
  if (e instanceof Error) return e.stack || e.message;
  if (typeof e === "string") return e;
  try { return JSON.stringify(e); } catch { return String(e); }
}

function isUuidLike(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

function fmtDate(d: Date | string | null | undefined) {
  try {
    if (!d) return "";
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
  } catch {
    return String(d ?? "");
  }
}

export default async function PatientDetail(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || !isUuidLike(id)) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">ID inválido</h1>
        <p className="mt-2 text-sm">El parámetro no parece un UUID: {id}</p>
      </main>
    );
  }

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
    if (!p) return <main className="p-6">No encontrado</main>;

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

    
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://odontologiapuelo.vercel.app";
  const cleanLink = `${base}/patients/${p.id}`;
  const magicLink = `${base}/patients/${p.id}?k=${encodeURIComponent(process.env.ACCESS_KEY2 ?? "")}`;

  return (
    <main className="p-6 space-y-8">
      <section className="border rounded-xl p-4 grid gap-3 md:grid-cols-2">
        <div>
          <h1 className="text-2xl font-semibold">{p.fullName}</h1>
          <div className="mt-1 text-sm text-gray-600">
            {p.docNumber ? <>DNI: {p.docNumber}<br /></> : null}
            {p.insuranceName ? <>Obra social: {p.insuranceName}<br /></> : null}
            {p.insuranceNumber ? <>N° credencial: {p.insuranceNumber}<br /></> : null}
            {p.phone ? <>Tel: {p.phone}<br /></> : null}
            {p.email ? <>Email: {p.email}<br /></> : null}
          </div>
        </div>

        {/* ⬇️ Reemplazo: el bloque con inputs ahora es un Client Component */}
        <CalendarLinks cleanLink={cleanLink} magicLink={magicLink} />
      </section>

        {/* Consultas */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">Consultas</h2>
            <Link className="border px-3 py-2 rounded" href={`/visits/new?patientId=${p.id}`}>Nueva consulta</Link>
          </div>
          {vs.length === 0 ? (
            <div className="text-sm text-gray-600">Sin consultas registradas aún.</div>
          ) : (
            <ul className="space-y-2">
              {vs.map(v => (
                <li key={v.id} className="border p-3 rounded">
                  <div className="text-xs text-gray-500">{fmtDate(v.date ?? p.createdAt)}</div>
                  <p className="whitespace-pre-wrap mt-1">{v.notes}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Archivos */}
        <section>
          <h2 className="text-lg font-medium mb-2">Archivos</h2>
          <form action="/api/uploads" method="post" encType="multipart/form-data" className="flex gap-2 items-center">
            <input type="hidden" name="patientId" value={p.id} />
            <input type="file" name="file" required />
            <button className="border px-3 py-2 rounded">Subir</button>
          </form>

          {fs.length === 0 ? (
            <div className="text-sm text-gray-600 mt-3">Sin archivos subidos.</div>
          ) : (
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              {fs.map(file => (
                <li key={file.id} className="border p-3 rounded">
                  <a className="text-blue-600 underline break-all" href={file.url} target="_blank" rel="noreferrer">
                    {file.filename}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
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



// import { db } from "@/lib/drizzle";
// import { patients } from "@/lib/schema";
// import { eq } from "drizzle-orm";

// export const dynamic = "force-dynamic";

// type Patient = typeof patients.$inferSelect;

// function getErrorMessage(e: unknown) {
//   if (e instanceof Error) return e.stack || e.message;
//   if (typeof e === "string") return e;
//   try { return JSON.stringify(e); } catch { return String(e); }
// }

// export default async function PatientDetail(
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params; // en Next 15 esto funciona (await de objeto va directo)
//     const [p] = await db.select().from(patients).where(eq(patients.id, id));

//     if (!p) return <main className="p-6">No encontrado</main>;

//     const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://odontologiapuelo.vercel.app";
//     const cleanLink = `${base}/patients/${p.id}`;
//     const magicLink = `${base}/patients/${p.id}?k=${encodeURIComponent(process.env.ACCESS_KEY2 ?? "")}`;

//     return (
//       <main className="p-6 space-y-4">
//         <h1 className="text-2xl font-semibold">Paciente</h1>
//         <pre className="p-3 bg-gray-50 rounded border text-sm">{JSON.stringify(p as Patient, null, 2)}</pre>
//         <div className="space-y-2">
//           <div><b>Link limpio</b> (para Calendar): <a className="text-blue-600 underline" href={cleanLink}>{cleanLink}</a></div>
//           <div><b>Magic link</b> (enrolar dispositivo): <a className="text-blue-600 underline" href={magicLink}>{magicLink}</a></div>
//         </div>
//       </main>
//     );
//   } catch (e) {
//     return (
//       <main className="p-6">
//         <h1 className="text-xl font-semibold">Error en ficha (vista mínima)</h1>
//         <pre className="mt-3 text-sm whitespace-pre-wrap">{getErrorMessage(e)}</pre>
//       </main>
//     );
//   }
// }
