"use client";
import { useRouter } from "next/navigation";

export default function DeletePatientButton({ id, name, redirectTo,
}: { id: string; name: string; redirectTo?: string }) {

    const router = useRouter();

    async function del() {
        if (!confirm(`Vas a eliminar a "${name}". También se borrarán sus consultas y archivos. ¿Continuar?`)) return;
        const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
        if (res.ok) {
            if (redirectTo) router.push(redirectTo);
            else location.reload();
        } else {
            alert("No se pudo eliminar");
        }
    }

    return (
        <button onClick={del} className="border px-3 py-2 rounded text-red-700">
            Eliminar paciente
        </button>
    );
}
