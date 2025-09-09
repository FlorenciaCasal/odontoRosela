"use client";
import { useRouter } from "next/navigation";
import IconButton from "@/app/components/ui/IconButton";
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
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600/50"
            aria-label="Eliminar paciente"
            title="Eliminar paciente"
        >
            <Trash2 className="h-4 w-4" />
            Eliminar paciente
        </button>
    );
}
