"use client";

export default function LogoutButton() {
  async function logout() {
    await fetch("/auth/logout", { method: "POST" });
    location.href = "/";
  }

  return (
    <button
      onClick={logout}
      className="text-sm text-slate-600 cursor-pointer hover:text-slate-900 transition"
    >
      Cerrar sesión
    </button>
  );
}
