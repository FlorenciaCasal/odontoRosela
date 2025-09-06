"use client";

export default function DeletePatientButton({ id, name }: { id: string; name: string }) {
    async function del() {
        if (!confirm(`Vas a eliminar a "${name}". También se borrarán sus consultas y archivos. ¿Continuar?`)) return;
        const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
        if (res.ok) location.reload();
        else alert("No se pudo eliminar");
    }
    return (
        <button onClick={del} className="border px-2 py-1 rounded text-red-700">
            Eliminar
        </button>
    );
}
