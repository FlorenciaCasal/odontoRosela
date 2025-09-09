"use client";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

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
        <button
            onClick={del}
            className="btn btn-danger"
            aria-label="Eliminar paciente"
            title="Eliminar paciente"
        >
            <Trash2 className="h-4 w-4" />
            Eliminar paciente
        </button>
    );
}
