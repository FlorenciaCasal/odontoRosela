import { db } from "@/lib/drizzle";
import { patients } from "@/lib/schema";
import { desc, ilike, or } from "drizzle-orm";
import Link from "next/link";
import DeletePatientButton from "@/app/components/DeletePatientButton";
import EditPatientInline from "@/app/components/EditPatientInline";
import PatientsSearchBox from "@/app/components/PatientsSearchBox";
import formatName from "@/utils/formatName";

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
          {rows.map((p) => {
            const secondary = [
              p.docNumber ? `DNI: ${p.docNumber}` : null,
              p.phone ? `Tel: ${p.phone}` : null,
              // p.email ? p.email : null,
            ].filter(Boolean);

            return (
              <li key={p.id} className="card p-2 sm:p-4">
                <div className="flex flex-row gap-3 items-center justify-between">

                  {/* Left */}
                  <div className="min-w-0">
                    <Link
                      href={`/patients/${p.id}`}
                      className="block truncate text-base sm:text-lg font-semibold text-strong hover:underline"
                      title={p.fullName}
                    >
                      {formatName(p.fullName) || "-"}
                    </Link>

                    {secondary.length ? (
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0 text-sm text-muted">
                        {secondary.map((t, i) => (
                          <span key={i} className="whitespace-nowrap">
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0 text-sm text-muted">Sin datos de contacto</div>
                    )}
                  </div>

                  {/* Right / Actions */}
               <div className="flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-3">
                    <EditPatientInline
                      p={{
                        id: p.id,
                        fullName: p.fullName,
                        docNumber: p.docNumber ?? null,
                        phone: p.phone ?? null,
                        email: p.email ?? null,
                        insuranceName: p.insuranceName ?? null,
                        insuranceNumber: p.insuranceNumber ?? null,
                        notes: p.notes ?? null,
                      }}
                    />
                    <DeletePatientButton id={p.id} name={p.fullName} />
                  </div>
                </div>
              </li>
            );
          })}
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

