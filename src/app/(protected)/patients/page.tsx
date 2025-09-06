import { db } from "@/lib/drizzle";
import { patients } from "@/lib/schema";
import { desc, ilike, or } from "drizzle-orm";
import Link from "next/link";
import DeletePatientButton from "@/app/components/DeletePatientButton";

export const dynamic = "force-dynamic";
// export const revalidate = 0; // opcional

export default async function PatientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  // ✅ sin "as any": aplicá .where(...) sólo si hay q
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
    <main className="p-6">
      <form className="flex gap-2 mb-4">
        <input name="q" defaultValue={q} placeholder="Buscar por nombre o DNI" className="border p-2 rounded w-full" />
        <button className="border px-3 py-2 rounded">Buscar</button>
      </form>
      <ul className="space-y-2">
        {rows.map(p => (
          <li key={p.id} className="border p-3 rounded flex items-start justify-between gap-3">
            <div>
              <Link href={`/patients/${p.id}`} className="font-medium">{p.fullName}</Link>
              {p.phone ? <div className="text-sm text-gray-600">{p.phone}</div> : null}
            </div>
            <DeletePatientButton id={p.id} name={p.fullName} />
          </li>
        ))}
      </ul>
    </main>
  );
}
