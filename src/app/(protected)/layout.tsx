import Link from "next/link";
import { ReactNode } from "react";
import LogoutButton from "../components/LogoutButton";

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-app flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container-app h-14 flex items-center justify-between">
          {/* Logo / nombre */}
          <Link
            href="/patients"
            className="text-sm font-semibold tracking-tight text-slate-900"
          >
            🦷 Consultorio
          </Link>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
