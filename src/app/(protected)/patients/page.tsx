import { db } from "@/lib/drizzle";
import { patients } from "@/lib/schema";
import { desc, ilike, or } from "drizzle-orm";
import Link from "next/link";
import PatientsSearchBox from "@/app/components/PatientsSearchBox";
import PatientRow from "@/app/components/PatientRow";

export const dynamic = "force-dynamic";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  const base = db.select().from(patients);
  const rows = await (
    q
      ? base.where(
        or(
          ilike(patients.fullName, `%${q}%`),
          ilike(patients.docNumber, `%${q}%`)
        )
      )
      : base
  )
    .orderBy(desc(patients.createdAt))
    .limit(50);

  return (
    <main className="min-h-screen bg-app px-4 py-8">
      <div className="mx-auto w-full max-w-4xl space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Pacientes
            </h1>
            <p className="text-sm text-slate-500">
              {q
                ? <>Resultados para <span className="font-medium">“{q}”</span></>
                : "Buscá, editá y gestioná pacientes del consultorio"}
            </p>
          </div>

          <Link
            href="/patients/new"
            // className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-900"
            className="
  inline-flex items-center gap-2
  rounded-xl bg-black text-white hover:bg-neutral-900
  text-base sm:text-sm
  px-4 py-2.5
  font-medium
"
          >
            + Nuevo paciente
          </Link>
        </div>


        {/* Search */}
        {/* <div className="card p-3"> */}
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <PatientsSearchBox />
        </div>

        {/* List */}



        <ul className="space-y-3">
          {rows.map((p) => (
             <PatientRow key={p.id} p={p} />
          ))}
        </ul>

        {/* Empty state */}
        {rows.length === 0 ? (
          <div className="card p-6 text-center text-sm text-muted">
            No se encontraron pacientes.
          </div>
        ) : null}
      </div>
    </main>
  );
}

