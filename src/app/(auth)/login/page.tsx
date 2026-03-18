import Link from "next/link";
import { normalizeRedirectPath } from "@/lib/auth/constants";

const ERROR_MESSAGES: Record<string, string> = {
  oauth_missing_params: "Faltaron datos al volver desde Google.",
  oauth_invalid_state: "La sesión de login expiró. Reintentá.",
  oauth_email_not_allowed: "Tu cuenta de Google no está autorizada para entrar.",
  oauth_failed: "No se pudo completar el login con Google.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const { redirect, error } = await searchParams;
  const redirectTo = normalizeRedirectPath(redirect);
  const href = `/auth/google/start?redirect=${encodeURIComponent(redirectTo)}`;

  return (
    <main className="min-h-screen px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md card p-6 sm:p-8">
        <div className="text-center space-y-2 mb-6">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-sky-500/15 flex items-center justify-center">
            🦷
          </div>
          <h1 className="text-2xl font-semibold">Ingresar</h1>
          <p className="text-sm muted">Acceso profesional con Google</p>
        </div>

        {error ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {ERROR_MESSAGES[error] ?? "No se pudo iniciar sesión."}
          </p>
        ) : null}

        <Link href={href} className="btn-primary w-full">
          Continuar con Google
        </Link>

        <div className="mt-6 text-center text-xs muted">
          Si ya tenés una sesión activa, vas a volver automáticamente a la ficha o evento que abriste.
        </div>
      </div>
    </main>
  );
}
