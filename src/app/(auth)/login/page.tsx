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
      body: JSON.stringify({ email, pass })
    });
    if (res.ok) location.href = "/patients";
    else setErr("Credenciales inválidas");
  }

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Ingresar</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Contraseña" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
        {err && <p className="text-red-600">{err}</p>}
        <button className="border px-4 py-2 cursor-pointer">Entrar</button>
      </form>
    </main>
  );
}
