import Link from "next/link";

export default function AppShell({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="container-app py-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-sky-500/15 flex items-center justify-center">
                🦷
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold">{title}</h1>
                {subtitle ? <p className="text-xs muted truncate">{subtitle}</p> : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {right}
            <Link href="/dashboard" className="btn hidden sm:inline-flex">Panel</Link>
            <Link href="/patients" className="btn hidden sm:inline-flex">Pacientes</Link>
          </div>
        </div>
      </header>

      <main className="container-app py-6">{children}</main>
    </div>
  );
}
