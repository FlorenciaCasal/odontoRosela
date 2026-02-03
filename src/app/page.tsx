
// export default function Home() {
//   return (
//     <main className="p-6 max-w-md mx-auto space-y-4">
//       <h1 className="text-xl font-semibold">Consultorio</h1>

//       <a href="/patients/new" className="btn">
//         Crear paciente
//       </a>

//       <a href="/patients" className="btn">
//         Ver pacientes
//       </a>
//     </main>
//   );
// }
// export default function Home() {
//   return (
//     <main className="p-6 max-w-md mx-auto space-y-4 text-center">
//       <h1 className="text-xl font-semibold">Consultorio odontológico</h1>

//       <p className="text-sm text-muted">
//         Acceso para profesionales
//       </p>

//       <a
//         href="/login"
//         className="border px-4 py-2 rounded inline-block"
//       >
//         Ingresar
//       </a>
//     </main>
//   );
// }

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-4xl grid gap-6 lg:grid-cols-2 items-stretch">
        {/* izquierda */}
        <section className="card p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2">
              <div className="h-10 w-10 rounded-2xl bg-sky-500/15 flex items-center justify-center">🦷</div>
              <span className="text-sm font-semibold">Consultorio</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">
              Gestión simple de pacientes y consultas
            </h1>

            <p className="text-sm sm:text-base muted">
              Acceso exclusivo para profesionales. Ingresá para crear pacientes, registrar consultas y ver archivos.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-2 pt-2">
              <Link href="/login" className="btn-primary w-full">Ingresar</Link>
              {/* <Link href="/patients" className="btn">Ver pacientes</Link> */}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="badge">Links desde Google Calendar</span>
            <span className="badge">Historial clínico</span>
            <span className="badge">Adjuntos</span>
          </div>
        </section>

        {/* derecha */}
        <section className="card p-6 sm:p-8 flex flex-col justify-center">
          <h2 className="text-lg font-semibold mb-3">Acceso profesional</h2>
          <p className="text-sm muted mb-6">
            Para mantenerlo privado, algunas secciones requieren sesión activa.
          </p>

          <div className="grid gap-3">
            <div className="card p-4">
              <div className="text-sm font-medium">Pacientes</div>
              <div className="text-xs muted">Crear, editar, eliminar y buscar por DNI.</div>
            </div>
            <div className="card p-4">
              <div className="text-sm font-medium">Consultas</div>
              <div className="text-xs muted">Registrar evolución y tratamientos.</div>
            </div>
            <div className="card p-4">
              <div className="text-sm font-medium">Archivos</div>
              <div className="text-xs muted">Subir imágenes y PDFs por paciente.</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}


