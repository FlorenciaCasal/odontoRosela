// export default function Dashboard() {
//   return (
//     <main className="p-6 max-w-md mx-auto space-y-4">
//       <h1 className="text-xl font-semibold">Panel</h1>

//       <a href="/patients/new" className="btn">
//         Crear paciente
//       </a>

//       <a href="/patients" className="btn">
//         Ver pacientes
//       </a>
//     </main>
//   );
// }
import Link from "next/link";
import AppShell from "@/app/components/AppShell";

export default function Dashboard() {
  return (
    <AppShell title="Dashboard" subtitle="Listo para tus turnos de hoy">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-lg font-semibold">Gestionar pacientes</h2>
          <p className="text-sm muted mt-1">
            Ver, editar y buscar pacientes por nombre o DNI.
          </p>
          <div className="mt-4">
            <Link href="/patients" className="btn-primary w-full sm:w-auto">
              Abrir
            </Link>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-semibold">Crear paciente</h2>
          <p className="text-sm muted mt-1">
            Registrá un paciente nuevo para que el Calendar lo linkee.
          </p>
          <div className="mt-4">
            <Link href="/patients/new" className="btn w-full sm:w-auto">
              Registrar
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

