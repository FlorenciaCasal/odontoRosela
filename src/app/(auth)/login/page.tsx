"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, pass }),
    });
    if (res.ok) location.href = "/patients";
    else setErr("Credenciales inválidas");
  }

  return (
    <main className="min-h-screen px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md card p-6 sm:p-8">
        <div className="text-center space-y-2 mb-6">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-sky-500/15 flex items-center justify-center">🦷</div>
          <h1 className="text-2xl font-semibold">Ingresar</h1>
          <p className="text-sm muted">Acceso para profesionales</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium muted">Email</label>
            <input className="input" placeholder="ej. dr.smith@clinica.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium muted">Contraseña</label>
            <input className="input" placeholder="••••••••" type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button className="btn-primary w-full">Entrar</button>
        </form>

        <div className="mt-6 text-center text-xs muted">
          Acceso seguro • Sesión persistente
        </div>
      </div>
    </main>
  );
}

