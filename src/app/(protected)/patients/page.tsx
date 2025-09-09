import { db } from "@/lib/drizzle";
import { patients } from "@/lib/schema";
import { desc, ilike, or } from "drizzle-orm";
import Link from "next/link";
import DeletePatientButton from "@/app/components/DeletePatientButton";
import EditPatientInline from "@/app/components/EditPatientInline";
import PatientsSearchBox from "@/app/components/PatientsSearchBox";

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
      <div className="flex gap-2 mb-4">
        <PatientsSearchBox />
      </div>
      <ul className="space-y-2">
        {rows.map(p => (
          <li key={p.id} className="border p-3 rounded flex items-start justify-between gap-3">
            <div>
              <Link href={`/patients/${p.id}`} className="font-medium">{p.fullName}</Link>
              {p.phone ? <div className="text-sm text-gray-600">{p.phone}</div> : null}
            </div>
            <EditPatientInline
              p={{
                id: p.id,
                fullName: p.fullName,
                docNumber: p.docNumber ?? null,
                phone: p.phone ?? null,
                email: p.email ?? null,
                insuranceName: p.insuranceName ?? null,
                insuranceNumber: p.insuranceNumber ?? null,
                notes: p.notes ?? null
              }} />
            <DeletePatientButton id={p.id} name={p.fullName} />
          </li>
        ))}
      </ul>
    </main>
  );
}
