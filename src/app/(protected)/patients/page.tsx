import { db } from "@/lib/drizzle";
import { patients } from "@/lib/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export default async function PatientsPage() {
  const rows = await db.select().from(patients).orderBy(desc(patients.createdAt)).limit(50);
  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Pacientes</h1>
        <Link href="/patients/new" className="border px-3 py-2">Nuevo</Link>
      </div>
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
