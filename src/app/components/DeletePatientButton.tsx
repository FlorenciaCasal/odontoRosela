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
            //  className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium bg-white text-red-600 border-red-200 hover:bg-red-50 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600/50 w-auto cursor-pointer"
            className="
  inline-flex items-center gap-2
  rounded-lg
  text-base sm:text-sm
  px-3 py-2 sm:px-4 sm:py-2.5
  font-medium
  bg-white text-red-600 border-red-200
  hover:bg-red-50 shadow-sm
  focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600/50
  w-auto cursor-pointer
"
            aria-label="Eliminar paciente"
        //  title="Eliminar paciente"
        >
            <Trash2 className="h-4 w-4" />
            {/* Eliminar paciente */}
        </button>
    );
}
