import { db } from "@/lib/drizzle";
import { patients } from "@/lib/schema";
import { desc, ilike, or } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";
// export const revalidate = 0; // opcional

export default async function PatientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const where = q
    ? or(ilike(patients.fullName, `%${q}%`), ilike(patients.docNumber, `%${q}%`))
    : undefined;

  const rows = await db.select().from(patients).where(where as any).orderBy(desc(patients.createdAt)).limit(50);
  return (
    <main className="p-6">
      <form className="flex gap-2 mb-4">
        <input name="q" defaultValue={q} placeholder="Buscar por nombre o DNI" className="border p-2 rounded w-full" />
        <button className="border px-3 py-2 rounded">Buscar</button>
      </form>
      <ul className="space-y-2">
        {rows.map(p => (
          <li key={p.id} className="border p-3 rounded">
            <Link href={`/patients/${p.id}`} className="font-medium">{p.fullName}</Link>
            {p.phone ? <div className="text-sm text-gray-600">{p.phone}</div> : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
